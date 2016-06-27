import * as Firebase from 'firebase';
import * as _ from 'underscore';
import logger from '../logger';
import MediaItemType from './MediaItemType';
import MediaItem from './MediaItem';
import { IndexableObject } from '../Interfaces/Indexable';
import { firebase as FirebaseConfig } from '../config';

export interface ArtistIndexableObject extends IndexableObject {
	image_url: string;
	name: string;
	lyrics_count: number;
	tracks_count: number;
	tracks: Object[];
}

class Artist extends MediaItem {
	constructor(attributes?: any, options?: any) {
		attributes.type = MediaItemType.artist;
		super(attributes, options);
	}
	
	defaults(): Backbone.ObjectHash {
		return {
			type: MediaItemType.artist
		};
	}

	get url(): Firebase {
		return this.getFirebaseReference(`/artists/${this.id}`);
	}

	public trackExists (songId: string) {
		return _.has(this.get('tracks'), songId);
	}

	get name(): string {
		return this.get('name');
	}

	public toIndexingFormat(): ArtistIndexableObject {
		let data: ArtistIndexableObject = _.extend({
			title: '',
			author: this.name || '',
			description: '',
			image_url: this.get('image_url') || '',
			name: this.name,
			lyrics_count: this.get('lyrics_count') || 0,
			tracks_count: this.get('tracks_count') || 0,
			tracks: this.get('tracks') || {}
		}, super.toIndexingFormat());

		return data;
	}
}

export default Artist;
