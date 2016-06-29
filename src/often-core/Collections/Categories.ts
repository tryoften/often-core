import { Firebase } from 'backbone';
import Category from '../Models/Category';

const firebase = require('firebase');

class Categories extends Firebase.Collection<Category> {
	constructor () {
		super([], {
			model: Category,
			autoSync: false
		});
	}

	get url() {
		return firebase.database().ref(`/categories`);
	}

}

export default Categories;
