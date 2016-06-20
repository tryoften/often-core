import BaseModel, { BaseModelAttributes }  from './BaseModel';
import { firebase as FirebaseConfig } from '../config';
import { generateURIfromGuid } from '../Utilities/generateURI';
import BaseModelType from './BaseModelType';

const sha1 = require('sha1');

export class ImageTransformType extends String {
	static original: ImageTransformType = 'original';
}

export interface ImageTransform {
	type: ImageTransformType;
	url: string;
	height: number;
	width: number;
	byte_size: number;
	format: string;
}

export interface ImageAttributes extends BaseModelAttributes {
	id?: string;
	source_url?: string;
	transforms?: any;
	tags?: string[];
	resize_datetime?: Date;
}

/**
 * Model that represents a category which can be assigned to a lyric or medium (quotes)
 */
class Image extends BaseModel {

	constructor(attributes: ImageAttributes = {}, opts: any = {autoSync: false, deepSync: false, setObjectMap: false}) {
		if (!attributes.id) {

			if (!attributes.source_url) {
				throw new Error('Url must be specified.');
			}

			attributes.id = generateURIfromGuid(sha1(attributes.source_url)).substring(0, 9);
		}
		attributes.type = BaseModelType.image;
		super(attributes, opts);
	}

	get url(): string {
		return `${FirebaseConfig.BaseURL}/images/${this.id}`;
	}

	get resize_datetime(): Date {
		return this.get('resize_datetime');
	}

	get tags(): string[] {
		return this.get('tags') || [];
	}

	get transforms(): any {
		return this.get('transforms');
	}

	get square_url(): string {
		return this.get('transforms').square.url || '';
	}

	get square_medium_url(): string {
		return this.get('transforms').square_medium.url || '';
	}

	get square_small_url(): string {
		return this.get('transforms').square_small.url || '';
	}

	get large_url(): string {
		return this.get('transforms').large.url || '';
	}

	get medium_url(): string {
		return this.get('transforms').medium.url || '';
	}

	get original_url(): string {
		return this.get('transforms').original.url || '';
	}

	get source_url(): string {
		return this.get('source_url') || '';
	}
}

export default Image;
