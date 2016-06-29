import { Firebase } from 'backbone';
import Image from '../Models/Image';

const firebase = require('firebase');

class Images extends Firebase.Collection<Image> {
	constructor (models = [], opts = { model: Image, autoSync: false}) {
		super(models, opts);
	}

	get url() {
		return firebase.database().ref(`/images`);
	}
}

export default Images;
