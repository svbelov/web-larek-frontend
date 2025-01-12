import { Component } from './base/Component';
import { IProductItem } from '../types/index';
import { ensureElement } from '../utils/utils';
import { cardCategory } from '../utils/constants';

interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export interface ICard extends IProductItem {
    index: string;
    button: string;
    buttonText: string;
}

export class Card extends Component<ICard> {
    protected _description: HTMLElement;
    protected _image: HTMLImageElement;
    protected _title: HTMLElement;
    protected _category: HTMLElement;
    protected _price: HTMLElement;
    protected _index: HTMLElement;
    protected _button: HTMLButtonElement;
    protected _buttonText: string;

    constructor(container: HTMLElement, actions?: ICardActions) {
        super(container);

        this._title = ensureElement<HTMLElement>('.card__title', container);
        this._price = ensureElement<HTMLElement>('.card__price', container);
        this._description = container.querySelector('.card__text');
        this._image = container.querySelector('.card__image');
        this._category = container.querySelector('.card__category');
        this._index = container.querySelector('.basket__item-index');
        this._button = container.querySelector('.card__button');

        if (actions?.onClick) {
            if (this._button) {
                this._button.addEventListener('click', actions.onClick);
            } else {
                container.addEventListener('click', actions.onClick);
            }
        }
    
    }

    set id(value: string) {
        this.container.dataset.id = value;
    }

    get id(): string {
        return this.container.dataset.id || '';
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    get title(): string {
        return this._title.textContent || '';
    }

	set buttonText(value: string) {
		this.setText(this._button, value);
	}

    set index(value: string) {
        this.setText(this._index, value);
    }
    
    get index(): string {
        return this._index.textContent || '';
    }
    
    set image(value: string) {
        this.setImage(this._image, value, this.title);
    }

    set description(value: string) {
        this.setText(this._description, value);
    }

    set category(value: string) {
        this.setText(this._category, value);
        this._category.className = `card__category ${cardCategory[value]}`;
    }

    get category(): string {
        return this._category.textContent || '';
    }

    set price(value: string | null) {
        if (value === null) {
            this.setText(this._price, 'Бесценно');
            this.setDisabled(this._button, true);
        } else {
            this.setText(this._price, value + ' синапсов');
            this.setDisabled(this._button, false);
        }
    }

    get price(): string {
        return this._price.textContent || '';
    }
}

