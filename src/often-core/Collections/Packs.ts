import Pack from '../Models/Pack';
import * as Backbone from 'backbone';

const firebase = require('firebase');

export default class Packs extends Backbone.Firebase.Collection<Pack> {
	constructor(models = [], options = {autoSync: false}) {
		super(models, Object.assign({}, options, {model: Pack}));
	}

	get url() {
		return firebase.database().ref(`/packs`);
	}

	generateBrowseSections(sections: [SectionAttributes]) {
		for (var section of sections) {
			var sectionPacks = this
				.filter(p => p.section.name = section.name)
				.map(p => p.toIndexingFormat());
			sections.push({
				id: section.id,
				name: section.name,
				items: sectionPacks,
				type: 'section'
			});
		}

		return sections;
	}
}
