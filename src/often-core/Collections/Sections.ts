import { Firebase } from 'backbone';
import Section from '../Models/Section';

const firebase = require('firebase');

class Sections extends Firebase.Collection<Section> {
    constructor (models = [], opts = { model: Section, autoSync: false}) {
        super(models, opts);
    }

    get url() {
        return firebase.database().ref(`/sections`);
    }
}

export default Sections;