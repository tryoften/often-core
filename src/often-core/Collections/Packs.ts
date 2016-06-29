import * as Backbone from 'backbone';
import Pack from '../Models/Pack';
import MediaItemGroup from '../Models/MediaItemGroup';
import { SectionAttributes } from '../Models/Section';

const firebase = require('firebase');

export default class Packs extends Backbone.Firebase.Collection<Pack> {
	constructor(models = [], options = {autoSync: false}) {
		super(models, Object.assign({}, options, {model: Pack}));
	}

	get url() {
		return firebase.database().ref(`/packs`);
	}

	generateBrowseSections(sections: [SectionAttributes]): MediaItemGroup[] {
		var mediaItemGroups: MediaItemGroup[] = [];

		for (var section of sections) {
			var sectionPacks = this
				.filter(p => p.section.name == section.name)
				.map(p => p.toIndexingFormat());

			mediaItemGroups.push({
				id: section.id,
				name: section.name,
				items: sectionPacks,
				type: 'section'
			});
		}

		return mediaItemGroups;
	}
}
