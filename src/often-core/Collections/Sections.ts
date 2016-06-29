import { Firebase } from 'backbone';
import Section from '../Models/Section';

class Sections extends Firebase.Collection<Section> {
    constructor (models = [], opts = { model: Section, autoSync: false}) {
        super(models, opts);
    }
}

export default Sections;