import React, { Component, useState } from 'react';
import styled from 'styled-components';

import packageJson from '../../../package.json';
import AppContext from '../../AppContext';
import { TransactionContext } from '../TransactionMonitor';
import Error from '../Error';
import Loader from '../Loader';
import AddForm from '../AddForm';
import AddressLink from '../AddressLink';

const ListOuter = styled.div`
margin: 20px auto;
width: 80%;
min-width: 450px;
`;

const LoadingOuter = styled.div`
margin-top: 20px;
display: flex;
align-items: center;
justify-content: center;
`;

const Row = styled.div`
display: flex;
flex-direction: row;
align-items: flex-start;
justify-content: stretch;
padding: 10px 5px;
border-bottom: 1px solid rgba(0,0,0,0.3);

&:first-child {
    border-top: 1px solid rgba(0,0,0,0.3);
}

&:hover {
    background-color: rgba(0,0,0,0.1);

    a {
        color: #282C34;
    }
}
`;

const TitleOuter = styled.div`
text-align: left;
flex-grow: 1;
`;

const Details = styled.div`

`;

const Target = styled.div`
flex-grow: 1;
`;

const Title = ({ children, details }) => {
    const [opened, setOpened] = useState(false);

    return (
        <TitleOuter onClick={() => setOpened(!opened)}>
            {children}
            {opened &&
                <Details>
                    {details.description}<br/>
                    Owner: <AddressLink address={details.address} />
                </Details>
            }
        </TitleOuter>
    );
};

const SignButtonOuter = styled.div`
flex-grow: 0;
margin-right: 10px;

button {
    padding: 3px 10px;
    font-size: 14px;
    border: none;
    outline: none;
    background-color: rgba(0,0,0,0.1);
    color: grey;
    cursor: pointer;
    border-radius: 5px;

    &:hover {
        background-color: white;
    }
}
`;

const SignButton = ({ active, onClick }) => {

    if (!active) {
        return null;
    }

    return (
        <SignButtonOuter>
            <button onClick={onClick}>Sign</button>
        </SignButtonOuter>
    );
};

const SignsOuter = styled.div`
display: flex;
flex-direction: row;
justify-content: flex-end;
width: 150px;
text-align: right;
`;

const Signs = ({ value, active, onClick }) => (
    <SignsOuter>
        <SignButton 
            active={active}
            onClick={onClick}
        />
        [ {value} ]
    </SignsOuter>
);

class ProjectsList extends Component {
    state = {
        loading: false,
        error: false,
        records: []
    };

    setStateAsync = state => new Promise(resolve => this.setState(state, resolve));

    fetchDonations = async (id) => {
        try {
            const { arweave } = this.context;

            const txids = await arweave.arql({
                op: 'and',
                expr1: {
                    op: 'equals',
                    expr1: 'App-Name',
                    expr2: packageJson.name
                },
                expr2: {
                    op: 'and',
                    expr1: {
                        op: 'equals',
                        expr1: 'Type',
                        expr2: 'crowdweave-project'
                    },
                    expr2: {
                        op: 'equals',
                        expr1: 'Petition',
                        expr2: id                        
                    }
                }
            });

            const records = await Promise.all(txids.map(async (tx) => {
                const transaction = await arweave.transactions.get(tx);
                const from = await arweave.wallets.ownerToAddress(transaction.get('owner'));
                return {
                    id: transaction.get('id'),
                    from,
                    transaction
                };
            }));

            return records;
        } catch(error) {
            this.setState({
                error
            });
        }
    };

    fetchList = async () => {
        try {
            const { arweave } = this.context;

            await this.setStateAsync({
                loading: true
            });

            const txids = await arweave.arql({
                op: 'and',
                expr1: {
                    op: 'equals',
                    expr1: 'App-Name',
                    expr2: packageJson.name
                },
                expr2: {
                    op: 'and',
                    expr1: {
                        op: 'equals',
                        expr1: 'App-Version',
                        expr2: packageJson.version
                    },
                    expr2: {
                        op: 'equals',
                        expr1: 'Type',
                        expr2: 'crowdweave-project'
                    }                    
                }
            });

            const records = await Promise.all(txids.map(async (tx) => {
                const donations = await this.fetchDonations(tx);
                const transaction = await arweave.transactions.get(tx);
                const {
                    name,
                    description,
                    address,
                    target
                } = JSON.parse(transaction.get('data', {
                    decode: true, 
                    string: true
                }));
                return {
                    id: transaction.get('id'),
                    name,
                    description,
                    address,
                    target,
                    donations,
                    transaction
                };
            }));

            console.log('>>>', records);

            await this.setStateAsync({
                loading: false,
                records
            });
        } catch(error) {
            this.setState({
                error
            });
        }
    };

    signPetition = async (id, transactionContext) => {
        try {
            const { arweave, wallet } = this.context;
            const transactionMonitor = transactionContext;
            const transaction = await arweave.createTransaction({
                data: id
            }, wallet);
            transaction.addTag('App-Name', packageJson.name);
            transaction.addTag('App-Version', packageJson.version);
            transaction.addTag('Unix-Time', Math.round((new Date()).getTime() / 1000));
            transaction.addTag('Type', 'sign');
            transaction.addTag('Petition', id);
            await arweave.transactions.sign(transaction, wallet);
            const response = await arweave.transactions.post(transaction);

            if (response.status === 400 || response.status === 500) {
                return this.setState({
                    error: new Error('Transaction failed')
                });
            }

            transactionMonitor(
                transaction.id, 
                () => this.fetchList(),
                error => this.setState({
                    error
                })
            );
        } catch(error) {
            this.setState({
                error
            });
        }
    };

    componentDidMount = () => {
        const { records } = this.state;

        if (records.length === 0) {
            this.fetchList();
        }
    }

    render() {
        const { records, loading, error } = this.state;
        const { loggedIn } = this.context;

        return (
            <div>
                <AddForm onSuccess={() => this.fetchList()}/>
                <ListOuter>
                    {(records && records.length > 0) && 
                        <TransactionContext.Consumer>
                            {(transactionContext) => records.map((r, i) => (
                                <Row key={i}>
                                    <Title details={r}>
                                        <strong>{i+1}:</strong> {r.name}
                                    </Title>
                                    <Target>Target: {r.target} AR</Target>
                                    {/* <Signs 
                                        value={r.signs.length} 
                                        active={loggedIn && r.signs.findIndex(t => t.from === loggedIn) === -1} //hide signed positions
                                        onClick={() => {
                                            this.signPetition(r.id, transactionContext);
                                        }} 
                                    /> */}
                                </Row>
                            ))}
                        </TransactionContext.Consumer>                    
                    }
                    {loading &&
                        <LoadingOuter><Loader /></LoadingOuter>
                    }
                    <Error error={error} onClose={() => this.setState({
                        error: false
                    })} />
                </ListOuter>           
            </div>            
        );
    }
}

ProjectsList.contextType = AppContext;

export default ProjectsList;
