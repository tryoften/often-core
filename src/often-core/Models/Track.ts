import { IndexableObject } from '../Interfaces/Indexable';
import { firebase as FirebaseConfig } from '../config';
import MediaItem from './MediaItem';
import Artist from './Artist';
import Lyric, { LyricAttributes } from './Lyric';
import * as _ from 'underscore';
import MediaItemType from './MediaItemType';

export interface TrackIndexableObject extends IndexableObject {
	images?: any;
	artist_id: string;
	artist_name: string;
	album_name: string;
	song_art_image_url: string;
}

/**
 * Track model throughout the platform
 */
class Track extends MediaItem {

	constructor(attributes?: any, options?: any) {
		super(attributes, options);
	}

	defaults(): Backbone.ObjectHash {
		return {
			type: MediaItemType.track
		};
	}

	get url(): Firebase {
		return this.getFirebaseReference(`/tracks/${this.id}`);
	}

	// TODO(jakub): create an interface for track that guarantees 'common' indexed fields
	get title(): string {
		return this.get('title');
	}

	get artist_id(): string {
		return this.get('artist_id');
	}

	get artist_name(): string {
		return this.get('artist_name');
	}

	get album_name(): string {
		return this.get('album_name');
	}

	get lyrics(): LyricAttributes[] {
		return this.get('lyrics') || [];
	}

	set lyrics(value: LyricAttributes[]) {
		this.set('lyrics', value);
	}

	public imageProperties(): string[] {
		return [
			'artist_image_url',
			'album_cover_art_url',
			'song_art_image_url'
		];
	}

	public toIndexingFormat(): IndexableObject {
		return _.extend({
			title: this.title || '',
			author: this.artist_name || '',
			description: '',
			artist_id: this.artist_id || '',
			artist_name: this.artist_name || '',
			album_name: this.album_name || '',
			song_art_image_url: this.get('song_art_image_url') || '',
			album_cover_art_url: this.get('album_cover_art_url') || this.get('song_art_image_url') || '',
			artist_image_url: this.get('artist_image_url') || ''
		}, super.toIndexingFormat())
	}
}

export default Track;
