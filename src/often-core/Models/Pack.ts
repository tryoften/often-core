import { firebase as FirebaseConfig } from '../config';
import MediaItemType from './MediaItemType';
import MediaItem from './MediaItem';
import * as Firebase from 'firebase';
import { MediaItemAttributes } from './MediaItem';
import * as _ from 'underscore';
import MediaItemSource from "./MediaItemSource";
import Category, {CategoryAttributes} from './Category';
import {IndexableObject} from '../Interfaces/Indexable';
import Featured from './Featured';

export type UserId = string;
export type PackMeta = Object;

export interface IndexablePackItem extends IndexableObject {
	id?: string;
	category?: CategoryAttributes;
};

export interface PackAttributes extends MediaItemAttributes {
	id?: string;
	name?: string;
	imageId?: string;
	image?: {
		square_small_url?: string,
		square_url?: string,
		small_url?: string,
		medium_url?: string,
		original_url?: string,
		large_url?: string
	};
	price?: number;
	premium?: boolean;
	featured?: boolean;
	published?: boolean;
	publishedTime?: string;
	description?: string;
	meta?: PackMeta;
	items?: IndexablePackItem[];
	items_count?: number;
	isFavorites?: boolean;
	isRecents?: boolean;
	shareCount?: number;
};

export interface PackOptions {
	autoSync?: boolean;
	setObjectMap?: boolean;
	deepSync?: boolean;
	rootRef?: Firebase;
}

export interface PackIndexableObject extends PackAttributes {}

export interface MediaItemInfo {
	type: MediaItemType;
	id: string;
}

class Pack extends MediaItem {

	rootURL: Firebase;
	/**
	 * Designated constructor
	 *
	 * @param attributes {PackAttributes}
	 * @param options
	 */
	constructor(attributes: PackAttributes = {}, options: PackOptions = {}) {
		attributes = _.defaults(attributes, {
			type: MediaItemType.pack,
			source: MediaItemSource.Often
		});

		options = _.defaults(options, {
			autoSync: false,
			setObjectMap: true,
			deepSync: false
		});

		if (!attributes.items) {
			attributes.items = [];
		}
		attributes.type = MediaItemType.pack;
		super(attributes, options);
	}

	initialize (attributes: PackAttributes, options: PackOptions) {
		let rootRef =  options.rootRef || this.getFirebaseInstance();
		this.rootURL = rootRef.ref(`/packs/${attributes.id}`);
	}

	get url(): Firebase {
		return this.rootURL;
	}

	defaults(): Backbone.ObjectHash {
		return {
			name: '',
			description: '',
			published: false,
			type: MediaItemType.pack,
			source: MediaItemSource.Often,
			premium: false,
			deleted: false,
			featured: false,
			price: 0.0,
			image: {
				small_url: 'http://placehold.it/200x200',
				large_url: 'http://placehold.it/400x400'
			},
			items: [],
			isFavorites: false,
			isRecents: false
		};
	}

	get name(): string {
		return this.get('name');
	}

	set name(value: string) {
		this.set('name', value);
	}

	get description(): string {
		return this.get('description');
	}

	get published(): boolean {
		return this.get('published');
	}

	get items(): IndexablePackItem[] {
		return this.get('items') || [];
	}

	get categories(): any {
		return this.get('categories') || {};
	}

	get items_count(): number {
		return this.get('items_count') || this.items.length;
	}

	get price(): number {
		return this.get('price') || 0.00;
	}

	get image(): any {
		return this.get('image') || {};
	}

	get premium(): boolean {
		return this.get('premium');
	}

	get featured(): boolean {
		return this.get('featured');
	}

	get isFavorites(): boolean {
		return this.get('isFavorites');
	}

	get isRecents(): boolean {
		return this.get('isRecents');
	}

	getTargetObjectProperties(): any {
		return {
			id: this.id,
			name: this.name,
			image: this.image,
			categories: this.categories,
			description: this.description,
			items: this.items,
			premium: this.premium,
			featured: this.featured,
			price: this.price,
			source: this.source,
			type: this.type,
			isFavorites: this.isFavorites,
			isRecents: this.isRecents
		};
	}

	/**
	 * Adds an individual media item to the pack
	 * @param item
     */
	addItem (item: MediaItem) {
		var itemObj = item.toJSON();

		var items = this.items;
		items.push(itemObj);

		this.save({items, items_count: items.length});
	}

	removeItem(item: IndexablePackItem) {
		var items = this.items;
		items = _.filter(items, a => a.id !== item.id);

		this.save({items});
	}

	updateFeatured() {
		let featuredPacks = new Featured({id: 'featuredPacks', type: MediaItemType.pack});
		featuredPacks.syncData().then( (fp) => {
			this.featured ? featuredPacks.addFeaturedItem(this) : featuredPacks.removeFeaturedItem(this.id);
		});
	}

	setItemPosition(itemId: string, newIndex: number) {

		let items = this.items;
		if (newIndex < 0 || newIndex >= items.length) {
			return false;
		}
		let oldIndex = _.findIndex(items, (itm) => itm.id === itemId);

		let item = items[oldIndex];
		items.splice(oldIndex, 1);
		items.splice(newIndex, 0, item);

		this.save({
			items: items
		});

	}

	assignCategoryToItem (itemId: string, category: Category) {

		var currentItems = this.items;
		var oldCategories = this.categories;

		for (let item of currentItems) {
			if (item.id === itemId) {
				item.category = category.toJSON();
			}
		}

		/* Recreate categories based on items */
		let newCategories = _.chain(currentItems)
			.map(item => item.category)
			.compact()
			.uniq(false, item => item.id)
			.value();


		let getCatIds = (arr) => {
			return _.map(arr, (itm: any) => itm.id);
		};
		let oldCategoryIds = getCatIds(oldCategories);
		let newCategoryIds = getCatIds(newCategories);

		for (let removedCategoryId of _.difference(oldCategoryIds, newCategoryIds)) {
			let oldCategory = new Category({ id: removedCategoryId });
			oldCategory.syncData().then( (oc) => {
				oldCategory.unsetTarget(this, `/packs/${this.id}/categories/${oldCategory.id}`);
			});
		}

		for (let addedCategoryId of _.difference(newCategoryIds, oldCategoryIds)) {
			category.setTarget(this, `/packs/${this.id}/categories/${addedCategoryId}`);
		}

		this.save({ items: currentItems, categories: newCategories });

	}

	/**
	 * Deserializes media items from an array of MediaItemInfo objects and sets them as items on the pack
	 *
	 * @param {MediaItemInfo[]}  mediaItemInfos - An array of MediaItemInfo items to be used for deserialization of corresponding media items
	 * @returns {Promise<IndexableObject[]>} - Promise resolving to an array of indexable objects derived from deserialized media items
	 */
	public setMediaItems (mediaItemInfos: MediaItemInfo[]): Promise<IndexablePackItem[]> {
		this.save();
		return new Promise((resolve, reject) => {

			this.deserializeMediaItems(mediaItemInfos).then( (mediaItems: MediaItem[]) => {
				var indexableMediaItems = this.getIndexableItems(mediaItems);
				this.save({items: indexableMediaItems});
				resolve(indexableMediaItems);
			});
		});
	}

	/**
	 * Turns an array of media items to an array of Indexebles by calling toIndexingFormat on each media item in the array
	 *
	 * @param {MediaItem[]} mediaItems - Array of media items
	 * @returns {IndexableObject[]} - Returns an array of indexable objects
	 */
	public getIndexableItems (mediaItems: MediaItem[]) {
		var indexables = [];
		for (var mi of mediaItems) {
			indexables.push(mi.toIndexingFormat());
		}
		return indexables;
	}

	/**
	 * Overwrite for base class's toIndexingFormat method
	 *
	 * @returns {IndexableObject}
	 *
	 */
	public toIndexingFormat(): IndexableObject {
		let data = _.extend({
			name: this.name || '',
			title: this.name || '',
			author: '',
			description: this.description || '',
			featured: this.featured || false,
			premium: this.premium || false,
			price: this.price || 0,
			image: this.image || {},
			items: this.items || [],
			items_count: this.items_count || this.items.length
		}, super.toIndexingFormat(), super.toJSON());

		return data;
	}

	/**
	 * Deserializes an array of MediaItemInfo items in order
	 *
	 * @param {MediaItemInfo[]} items - Objects representing media items
	 * @returns {Promise<MediaItem[]>} - Promise that resolves to an array of synced media items
	 */
	private deserializeMediaItems (items: MediaItemInfo[]): Promise<MediaItem[]> {

		var mediaItemPromises = [];

		for (let i = 0; i < items.length; i++) {
			mediaItemPromises[i] = this.fetchMediaItemFromInfo(items[i]);
		}

		return Promise.all(mediaItemPromises);
	}

	/**
	 * Returns a de-serialized media object derived from MediaItemInfo
	 *
	 * @param {MediaItemInfo} item - Object containing information to deserialize a media item
	 * @returns {Promise<MediaItem>} - Returns a promise resolving to a synced MediaItem from database.
	 */
	private fetchMediaItemFromInfo (item: MediaItemInfo): Promise<MediaItem> {
		var MediaItemClass = MediaItemType.toClass(item.type);
		return new MediaItemClass({id: item.id}).syncData();
	}


}

export default Pack;
