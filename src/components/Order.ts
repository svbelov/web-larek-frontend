import { Form } from './common/Form';
import { IOrderForm } from '../types/index';
import { IEvents } from './base/events';
import { ensureElement } from '../utils/utils';

interface IOrderActions {
    onClick: (event: MouseEvent) => void;
}

export const PaymentMethods:{[key: string]: string} = {
    "card": "online",
    "cash": "cash"
}

export class Order extends Form<IOrderForm> {
    protected _onlinePayButton: HTMLButtonElement;
    protected _cashPayButton: HTMLButtonElement;
    protected _address: HTMLInputElement;
    
    constructor(container: HTMLFormElement, events: IEvents, actions?: IOrderActions) {
        super(container, events);

        this._onlinePayButton = ensureElement<HTMLButtonElement>('button[name="card"]', this.container);
        this._cashPayButton = ensureElement<HTMLButtonElement>('button[name="cash"]', this.container);
        this.toggleClass(this._onlinePayButton, 'button_alt-active', true);
        
        if (actions?.onClick) {
            this._onlinePayButton.addEventListener('click', actions.onClick);
            this._cashPayButton.addEventListener('click', actions.onClick);
        }

        this._address = ensureElement<HTMLInputElement>('input', this.container);
    }

    togglePayButtons(activeButton: HTMLButtonElement) {
        this.toggleClass(this._onlinePayButton, 'button_alt-active', false);
        this.toggleClass(this._cashPayButton, 'button_alt-active', false);
        this.toggleClass(activeButton, 'button_alt-active');
      }
    
    set address(value: string) {
        this._address.value = value;
    }

}

export class Contacts extends Form<IOrderForm> {
    protected _phone: HTMLInputElement;
    protected _email: HTMLInputElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events)
        this._phone = ensureElement<HTMLInputElement>('input[name="phone"]', this.container);
        this._email = ensureElement<HTMLInputElement>('input[name="email"]', this.container);   
    }

     set phone(value: string) {
        this._phone.value = value;
    }

    set email(value: string) {
        this._email.value = value;
    }
}