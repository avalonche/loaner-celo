// make transaction request to the celo wallet
import { ContractKit } from '@celo/contractkit';
import { toTxResult } from '@celo/connect';
import {
    requestTxSig,
    FeeCurrency,
    waitForSignedTxs,
    TxParams,
} from '@celo/dappkit';
import { TransactionReceipt } from 'web3-core';
import { Linking } from 'expo';

export interface Transaction {
    from: string,
    to:string,
    txObject: any
}

async function celoWalletRequest(
    txs: Transaction[],
    requestId: string,
    kit: ContractKit
): Promise<TransactionReceipt[] | undefined> {
    const dappName = 'loaner';
    const callback = Linking.makeUrl('/');
    try {
        const requestTxs = txs.map(({ from, to, txObject }) => {
            let requestTx: TxParams = {
                from,
                tx: txObject,
                feeCurrency: FeeCurrency.cUSD,
            };
            if (to !== '0x0000000000000000000000000000000000000000') {
                requestTx = {
                    ...requestTx,
                    to,
                };
            }
            return requestTx
        });

        await requestTxSig(kit, requestTxs, {
            requestId,
            dappName,
            callback,
        });
        const dappkitResponse = await waitForSignedTxs(requestId);
        const txResults: TransactionReceipt[] = []
        for (const tx of dappkitResponse.rawTxs) {
            txResults.push(await toTxResult(kit.web3.eth.sendSignedTransaction(tx)).waitReceipt());
        }
        return txResults;
    } catch (e) {
        // as transaction requests get pending, they then resume all at once
        if (e.toLowerCase().includes('known transaction')) {
            return;
        }
        throw new Error(e);
    }
}

export { celoWalletRequest };
