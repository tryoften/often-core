import { generate as generateId } from 'shortid';
import BaseModelType from './BaseModelType';
import BaseModel from './BaseModel';
import { BaseModelAttributes } from '../Models/BaseModel';

export interface SectionAttributes {
    id?: string;
    name?: string;
}

/**
 * Model that represents a section which can be used to organize a pack (ex. TV Show, Celebrity)
 */
class Section extends BaseModel {
    constructor(attributes: BaseModelAttributes = {}, opts: any = {autoSync: false, deepSync: true, setObjectMap: true}) {

        if(!attributes.id) {
            attributes.id = generateId();
        }

        attributes.type = BaseModelType.section;
        super(attributes, opts);
    }

    get name(): string {
        return this.get('name');
    }

    get url(): Firebase {
        return this.getFirebaseReference(`/sections/${this.id}`);
    }
}

export default Section;


