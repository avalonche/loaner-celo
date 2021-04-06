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

async function celoWalletRequest(
    from: string,
    to: string,
    txObject: any,
    requestId: string,
    kit: ContractKit
): Promise<TransactionReceipt | undefined> {
    const dappName = 'loaner';
    const callback = Linking.makeUrl('/');
    try {
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
        await requestTxSig(kit, [requestTx], {
            requestId,
            dappName,
            callback,
        });
        const dappkitResponse = await waitForSignedTxs(requestId);
        const tx = dappkitResponse.rawTxs[0];
        return toTxResult(kit.web3.eth.sendSignedTransaction(tx)).waitReceipt();
    } catch (e) {
        // as transaction requests get pending, they then resume all at once
        if (e.toLowerCase().includes('known transaction')) {
            return;
        }
        throw new Error(e);
    }
}

export { celoWalletRequest };
