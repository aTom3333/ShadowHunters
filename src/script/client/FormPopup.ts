import {Popup} from "./Popup";



function buildForm(description: any, root: HTMLElement): HTMLElement {
    for(const field in description) {
        if(description.hasOwnProperty(field)) {
            if(typeof description[field] === 'string') {
                // Create input
                let elem: HTMLElement;
                switch (description[field]) {
                    case 'string':
                        elem = document.createElement('input');
                        (elem as HTMLInputElement).type = 'text';
                        (elem as HTMLInputElement).name = field;
                        break;
                    case 'number':
                        elem = document.createElement('input');
                        (elem as HTMLInputElement).type = 'number';
                        (elem as HTMLInputElement).name = field;
                        break;
                        // TODO Continue
                }

                const label = document.createElement('label');
                label.append(field+' : ', elem);
                root.append(label);
            } else {
                const fieldset = document.createElement('fieldset');
                const legend = document.createElement('legend');
                legend.append(field);
                fieldset.append(legend);
                buildForm(description[field], fieldset);
                root.append(fieldset);
            }
        }
    }

    return root;
}

function extractForm(description: any, root: HTMLElement, data: Object) {
    for(const field in description) {
        if(description.hasOwnProperty(field)) {
            if(typeof description[field] === 'string') {
                const input: any = root.querySelector('input[name="'+field+'"]');
                data[field] = input.value;
            } else {
                // TODO Think about this
                /*const fieldset = document.createElement('fieldset');
                const legend = document.createElement('legend');
                legend.append(field);
                fieldset.append(legend);
                buildForm(description[field], fieldset);
                root.append(fieldset);*/
            }
        }
    }
}


export class FormPopup<T> extends Popup<T> {
    private form: HTMLFormElement;
    private description: any;

    constructor(formObject: any, cancelValue: T = null) {
        const form = document.createElement('form');
        buildForm(formObject, form);
        super(form, cancelValue);
        this.description = formObject;
        this.form = form;
    }

    launch(close: Function) {
        super.launch(close);
        this.form.addEventListener('submit', (event: Event) => {
            event.preventDefault();

            const data = {};
            extractForm(this.description, this.form, data);
            console.log(data);
            this.closePopup(data);
        });
    }
}
