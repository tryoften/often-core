import BaseModelType from '../Models/BaseModelType';
export interface GraphableAttributes {
    type: BaseModelType;
}

interface Graphable {
    toGraphingFormat(): GraphableAttributes;
}

export default Graphable;