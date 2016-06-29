import MediaItemType from './MediaItemType';
import MediaItem from "./MediaItem";
import { IndexableObject } from "../Interfaces/Indexable";

export default class MediaItemGroup {
	id: string;
	name: string;
	items: IndexableObject[];
	type: MediaItemType;

	constructor(type, items) {

		this.type = type;
		this.items = items;
	}
}
