import BaseModel from './BaseModel';
import User from './User';
import { firebase as FirebaseConfig } from '../config';
import { generate as generateId } from 'shortid';
import BaseModelType from './BaseModelType';
import { BaseModelAttributes, BaseModelOptions } from './BaseModel';

export interface NotificationAttributes extends BaseModelAttributes {
    id?: string;
    url?: string;
    creationDate?: Date;
    releaseDate?: Date;
    target?: String;
}

export interface NotificationOptions extends BaseModelOptions {
    autoSync: boolean;
    setObjectMap?: boolean;
    deepSync?: boolean;
    rootRef?: Firebase;
}

export interface FirebaseAttributes {
    title: string;
    text: string;
    packId: string;
}

class Notification extends BaseModel {
    rootURL: Firebase;
    constructor(attributes: NotificationAttributes = {}, opts: NotificationOptions = {autoSync: false, deepSync: false, setObjectMap: false}) {
        if (!attributes.id) {
            attributes.id = generateId();
        }
        attributes.type = BaseModelType.notification;
        super(attributes, opts);
    }

    initialize (attributes: NotificationAttributes, options: NotificationOptions) {
        let rootRef =  options.rootRef || this.getFirebaseInstance();
        this.rootURL = rootRef.ref(`/notifications/${this.id}`);
    }

    get url(): Firebase {
        return this.rootURL;
    }

    get title(): string {
        return this.get('title') || '';
    }

    get creationDate(): Date {
        return this.get('creationDate') || '';
    }

    get releaseDate(): Date {
        return this.get('releaseDate') || '';
    }

    get target(): string {
        return this.get('target') || '';
    }

    get text(): string {
        return this.get('text') || '';
    }

    get packId(): string {
        return this.get('packId') || '';
    }

    serializeToFirebase(): FirebaseAttributes {
        return {
            title: this.title,
            text: this.text,
            packId: this.packId
        };
    }
}

export default Notification;


