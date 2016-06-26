import * as Firebase from 'firebase';
import 'backbonefire';
import * as _ from 'underscore';
import * as ObjectHash from 'object-hash';
import { Firebase as BackboneFire } from 'backbone';
import { firebase as FirebaseConfig } from '../config';
import BaseModelType from "./BaseModelType";
import BaseModel from "./BaseModel";

export interface ObjectMapAttributes {
	type: BaseModelType;
	id: string;
	deepSync?: boolean;
}

class ObjectMap extends BackboneFire.Model {
	protected rootURL: Firebase;
	protected rootRef: Firebase;
	protected deepSync: boolean;

	constructor(attributes: ObjectMapAttributes, options: any = {}) {
		if (!attributes.type) {
			throw new Error('Type must be defined in object map attributes.');
		}

		if (!attributes.id) {
			throw new Error('ItemId must be defined in object map attributes');
		}

		options = _.defaults(options, {
			autoSync: false,
			deepSync: false
		});

		super(attributes, options);
	}

	initialize (attributes, options) {
			this.rootURL = options.dbInstance.ref(`/object_map/${attributes.type}/${attributes.id}`);
			this.rootRef = options.dbInstance;
			this.deepSync = options.deepSync;
	}

	get url(): Firebase {
		return this.rootURL;
	}

	get type(): string {
		return this.get('type');
	}

	public syncModel (): Promise<BackboneFire.Model> {
		return new Promise<BackboneFire.Model>( (resolve, reject) => {
			this.once('sync', model => {
				resolve(model);
			});
			this.fetch({
				error: (err) => {
					reject(err);
				}
			});
		});
	}

	get targets() {
		return this.get('targets') || {};
	}

	setTarget (model: BaseModel, targetPath: string) {
		let id = model.id;
		let type = model.type;
		var currentTargets = this.targets;
		var targetPathHash = ObjectHash(targetPath);

		if (currentTargets[id]) {
			var paths = currentTargets[id].paths || {};
			paths[targetPathHash] = targetPath;
			currentTargets[id].paths = paths;
		} else {

			var updateObject = {
				id: id,
				type: type,
				paths: {}
			};

			updateObject.paths[targetPathHash] = targetPath;
			currentTargets[id] = updateObject;
		}

		this.save({targets: currentTargets});
	}

	unsetTarget (model: BaseModel, targetPath: string) {
		var id = model.id;
		var currentTargets = this.targets;
		var targetPathHash = ObjectHash(targetPath);

		if (currentTargets[id]) {
			var paths = currentTargets[id].paths || {};
			paths[targetPathHash] = null;
		}

		this.save({targets: currentTargets});
	}

	updateTargetsWithProperties (props: any): Promise<boolean> {

		var updatedTargets = new Promise((resolve, reject) => {
			var targets = this.targets;

			var updateObject = {};
			/* Loop through each target's path */
			for (let targetId in targets) {
				var paths = targets[targetId].paths;
				if (paths) {
					for (let pathHash in paths) {
						var actualPath = paths[pathHash];
						updateObject[actualPath] = props;
					}
				}
			}

			this.rootRef.update(updateObject, (error) => {
				if (error) {
					reject(error);
					return;
				}
				resolve(targets);
			});

		});

		return new Promise((resolve, reject) => {
			updatedTargets.then((targets: any[]) => {
				if (this.deepSync) {
					/* Instantiate each target and then call save on each */
					var syncedPromises = [];
					for (var targetId in targets) {
						var target = targets[targetId];
						var BaseModelClass = BaseModelType.toClass(target.type);
						let syncPromise = new BaseModelClass({id: target.id, type: target.type}).syncData();
						syncedPromises.push(syncPromise);
					}
					return Promise.all(syncedPromises);
				}
				return Promise.resolve([]);
			}).then( (results) => {
				for (let result of results) {
					result[0].save();
				}
				resolve(results);
			}).catch( (err: Error) => {
				reject(err);
				return;
			});
		});

	}
}

export default ObjectMap;
