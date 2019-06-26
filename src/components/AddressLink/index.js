import React from 'react';

export default ({ address, balance }) => {
    const url = `https://viewblock.io/arweave/address/${address}`;
    return (
        <span>
            <a 
                href={url} 
                rel="noopener noreferrer" 
                target="_blank" 
                title="Arweave Block Explorer"
            >{address.slice(0, 6)}...${address.slice(-4)}</a>
            {balance !== undefined &&
                <span>
                    &nbsp;({Number(balance).toFixed(2)} AR)
                </span>
            }
        </span>        
    );
};