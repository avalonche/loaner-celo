import { ContractReceipt, Event } from 'ethers';

export function filterEvent(
    tx: ContractReceipt,
    eventName: string,
): Event | undefined {
    if (tx.events) {
        for (let index = 0; index < tx.events.length; index++) {
            const event = tx.events[index];
            if (event.event === eventName) {
                return event;
            }
        }
    }
    return undefined;
}