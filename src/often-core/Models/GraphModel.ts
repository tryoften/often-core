import {IndexableObject} from '../Interfaces/Indexable';
import {GraphableAttributes} from '../Interfaces/Graphable';
const neo4j = require('neo4j-driver').v1;

class GraphModel {

    private static _instance: GraphModel;
    driver: any;
    session: any;

    constructor() {
        if (!GraphModel._instance) {
            GraphModel._instance = this;
            this.driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "neo4j123"));
            this.session = this.driver.session();
        }
        return GraphModel._instance;
    }

    updateNode(param: GraphableAttributes) {
        let header = this.createQueryHeader(param);
        let command = `MERGE (:${param.type} ${header})`;
        return this.session.run(command, {param});
    }

    createQueryHeader(param: GraphableAttributes) {
        let keys = Object.keys(param);
        let query = "";
        for (let i = 0; i < keys.length; i++) {
            let k = keys[i];
            query = query.concat(`${k}: {param}.${k} ${(i + 1 === keys.length) ? "" : ","}`);
        }
        return `{${query}}`;
    }

}

export default GraphModel