import { firebase as FirebaseConfig } from '../config';
import BaseModel from '../Models/BaseModel';
import Subscription, { SubscriptionAttributes } from '../Models/Subscription';
import Pack, { PackAttributes } from '../Models/Pack';
import MediaItemType from './MediaItemType';
import BaseModelType from './BaseModelType';
import MediaItemSource from "./MediaItemSource";
import {IndexableObject} from '../Interfaces/Indexable';

export interface UserAttributes {
	id?: string;
	name?: string;
	firstName: string;
	username: string;
	isAdmin: boolean;
	image: {
		small_url: string;
		large_url: string;
	};
}

/**
 * This class is responsible for providing granular functionalities (mostly accessors) for users.
 */
class User extends BaseModel {

	constructor(attributes: any = {}, options?: any) {
		attributes.type = BaseModelType.user;
		super(attributes, options);
	}

	defaults(): Backbone.ObjectHash {
		return {
			type: BaseModelType.user,
			shareCount: 0,
			image: {
				small_url: 'http://placehold.it/200x200',
				large_url: 'http://placehold.it/400x400'
			}
		};
	}

	/* Getters */
	get url(): Firebase {
		return this.getFirebaseReference(`/users/${this.id}`);
	}

	get packs() {
		return this.get('packs') || {};
	}

	get packSubscriptions() {
		return this.get('pack_subscriptions') || {};
	}

	get username(): string {
		return this.get('username')
	}

	get name(): string {
		return this.get('name') || `${this.firstName} ${this.lastName}`;
	}

	get firstName(): string {
		return this.get('first_name');
	}

	get lastName(): string {
		return this.get('last_name');
	}

	get favoritesPackId(): string {
		return this.get('favoritesPackId');
	}

	get recentsPackId(): string {
		return this.get('recentsPackId');
	}

	get isAdmin(): boolean {
		return this.get('isAdmin');
	}

	get shareCount(): number {
		return this.get('shareCount') || 0;
	}

	/**
	 * Initializes a favorites pack
	 * @returns {Promise<string>} - Promise resolving to a pack id or an error.
	 */
	initFavoritesPack(): Promise<string> {
		var favoritesPackAttributes: PackAttributes = {
			name: this.firstName ? `${this.firstName}'s Favorites` : 'Your Favorites',
			description: this.firstName ? `${this.firstName}'s favorite selections` : 'Your favorite selections',
			published: false,
			type: MediaItemType.pack,
			source: MediaItemSource.Often,
			setObjectMap: true,
			premium: false,
			price: 0.0,
			image: {
				small_url: this.get('profile_pic_large') || this.get('profileImageLarge') || '',
				large_url: this.get('profile_pic_small') || this.get('profileImageSmall') || ''
			},
			owner: this.getTargetObjectProperties(),
			items: [],
			isFavorites: true,
			isRecents: false
		};

		return new Promise((resolve, reject) => {
			if (!this.favoritesPackId) {
				this.addPack(favoritesPackAttributes).then((packId) => {
					this.save({
						favoritesPackId: packId
					});
					resolve(packId);
				});
			} else {
				resolve(this.favoritesPackId);
			}
		});
	}

	incrementShareCount() {
		this.set({
			shareCount: this.shareCount + 1
		});
	}

	getTargetObjectProperties(): UserAttributes {
		return {
			id: this.id,
			name: this.get('name'),
			firstName: this.firstName || "",
			isAdmin: !!this.isAdmin,
			image: this.get('image'),
			username: this.get('username')
		};
	}

	/**
	 * Initializes a recents pack for a user
	 * @returns {Promise<string>} - Promise resolving to a pack id or an error.
	 */
	initRecentsPack(): Promise<string> {
		var recentsPackAttributes: PackAttributes = {
			name: this.firstName ? `${this.firstName}'s Recents` : 'Your Recents',
			description: this.firstName ? `${this.firstName}'s recents selections` : 'Your recents selections',
			published: false,
			type: MediaItemType.pack,
			source: MediaItemSource.Often,
			owner: this.getTargetObjectProperties(),
			setObjectMap: true,
			premium: false,
			price: 0.0,
			image: {
				small_url: this.get('profile_pic_large') || this.get('profileImageLarge') || '',
				large_url: this.get('profile_pic_small') || this.get('profileImageSmall') || ''
			},
			items: [],
			isFavorites: false,
			isRecents: true
		};

		return new Promise((resolve, reject) => {
			if (!this.recentsPackId) {
				this.addPack(recentsPackAttributes).then((packId) => {
					this.save({
						recentsPackId: packId
					});
					resolve(packId);
				});
			} else {
				resolve(this.recentsPackId);
			}
		});
	}

	/**
	 * Initializes a default pack
	 * @returns {Promise<any>}
	 */
	initDefaultPack(): Promise<any> {
		var defaultPackAttributes: PackAttributes = {
			id: 'EJDW_ze1-' // DJ Khaled Pack for now
		};

		return this.addPack(defaultPackAttributes);
	}

	/**
	 * Sets the authentication token on a user
	 * @param {string} token - SHA256 encoded string
	 *
	 * @return {void}
	 */
	public setToken (token: string) {
		this.set('auth_token', token);
	}

	/**
	 * Instantiates a pack and adds it to the user's pack collection
	 * @param packSubAttrs {SubscriptionAttributes} - Object containing pack subscription information
	 * @returns {Promise<string>} - Returns a promise that resolves to a success message or to an error when rejected
	 */
	public addPack (packAttributes: PackAttributes, subscriptionAttributes: SubscriptionAttributes = {}): Promise<string> {
		return new Pack(packAttributes).syncData().then((pack) => {
			return new Promise((resolve, reject) => {
				pack.save({}, {
					success: (syncedPack: Pack) => {
						let userAttributes = this.getTargetObjectProperties();
						syncedPack.addFollower(userAttributes);
						let indexablePack = syncedPack.toIndexingFormat();
						this.setPack(indexablePack);
						this.save();
						syncedPack.save();
						syncedPack.setTarget(this, `/users/${this.id}/packs/${syncedPack.id}`);
						resolve(indexablePack.id)
					},
					error: (err) => {
						reject(err);
					}
				});
			});
		});
	}

	/**
	 * Removes a pack from a user model
	 * @param packSubAttrs {SubscriptionAttributes} - object containing subscription data
	 * @returns {Promise<string>} - Returns a promise that resolves to packId that was removed or to an error when rejected
	 */
	public removePack (packId: string): Promise<string> {
		return new Pack({id: packId}).syncData().then( (pack: Pack) => {
			let userAttributes = this.getTargetObjectProperties();
			pack.unsetTarget(this, `/users/${this.id}/packs/${pack.id}`);
			pack.removeFollower(userAttributes);
			this.unsetPack(packId);
			this.save();
			pack.save();
			return packId;
		});
	}

	/**
	 * Sets a subscription object on user's subscriptions if it hasn't been set yet
	 * @param sub {Subscriptions} - Subscription object
	 */
	private setSubscription (sub: IndexableObject) {
		let currentPackSubscriptions = this.packSubscriptions;
		if (!currentPackSubscriptions[sub.id]) {
			currentPackSubscriptions[sub.id] = sub;
			this.set({ pack_subscriptions: currentPackSubscriptions });
		}
	}

	/**
	 * Sets a pack on user's packs
	 * @param pack {Pack} - Pack to be added
	 */
	private setPack (pack: IndexableObject) {
		let currentPacks = this.packs;
		if (!currentPacks[pack.id]) {
			currentPacks[pack.id] = pack;
			this.set({ packs: currentPacks });
		}
	}

	/**
	 * Unsets a pack on user's packs
	 * @param packId {string} - Unsets a pack on user's pack collection
	 */
	private unsetPack (packId: string) {
		let currentPacks = this.packs;
		if (currentPacks[packId]) {
			currentPacks[packId] = null;
			this.set({ packs: currentPacks });
		}
	}
}

export default User;
