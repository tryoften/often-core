import * as _ from 'underscore';
import { MediaItem, MediaItemAttributes } from './MediaItem';
import { firebase as FirebaseConfig } from '../config';
import { IndexableObject } from '../Interfaces/Indexable';
import MediaItemType from './MediaItemType';
import Artist from './Artist';
import Track from './Track';
import Category from './Category';

export interface LyricAttributes extends MediaItemAttributes {}

export interface LyricIndexableObject extends IndexableObject {
	images?: any;
	text: string;
	artist_name: string;
	track_title: string;
	track_id: string;
	artist_id: string;
	artist_image_url: string;
}

class Lyric extends MediaItem {

	constructor(attributes?: any, options?: any) {
		attributes.type = MediaItemType.lyric;
		super(attributes, options);
	}
	defaults(): Backbone.ObjectHash {
		return {
			type: MediaItemType.lyric
		};
	}

	get url(): Firebase {
		return this.getFirebaseReference(`/lyrics/${this.id}`);
	}

	// TODO(jakub): create an interface for lyric that guarantees 'common' indexed fields
	set artist_id(value: string) {
		this.set('artist_id', value);
	}

	get artist_id(): string {
		return this.get('artist_id');
	}

	get text(): string {
		return this.get('text');
	}

	get artist_name(): string {
		return this.get('artist_name');
	}

	get track_name(): string {
		return this.get('track_name');
	}

	set text(value: string) {
		this.set('text', value);
	}

	get score(): number {
		return this.get('score');
	}

	set score(value: number) {
		this.set('score', value);
	}

	get category(): Category {
		return new Category(this.get('category'));
	}

	set category(value: Category) {
		this.set('category', value.toJSON());
	}

	public toIndexingFormat(): IndexableObject {

		let data: LyricIndexableObject = _.extend({
			title: this.track_name || '',
			author: this.artist_name || '',
			description: this.text || '',
			text: this.text || '',
			images: this.images,
			artist_id: this.get('artist_id') || '',
			track_id: this.get('track_id') || '',
			artist_name: this.get('artist_name') || '',
			track_title: this.get('track_title') || '',
			artist_image_url: this.get('artist_image_url') || ''
		}, super.toIndexingFormat());

		return data;
	}
}

export default Lyric;
