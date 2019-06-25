import React from 'react';

export default ({ address }) => {
    const url = `https://viewblock.io/arweave/address/${address}`;
    return (
        <a 
            href={url} 
            rel="noopener noreferrer" 
            target="_blank" 
            title="Arweave Block Explorer"
        >{address}</a>
    );
};