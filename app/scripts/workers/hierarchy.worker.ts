
export class HierarchyWorker {
    private idHashMap: any;
    private linkHashMap: any;
    ///////////////////////////
    // public api
    constructor() {
    }


    
    public async setAnnotation(annotation, path, levelName) {
      this.createIdHashMap(path, annotation);
      this.createLinkHashMap(annotation);
      path.forEach(ln => {
          if(ln !== path[path.length]){
              this.giveTimeToParents(ln, annotation);
            }
      });
      console.log(this.getLevelDetails(levelName, annotation));
      return this.getLevelDetails(levelName, annotation);
    }

    private giveTimeToParents(levelName, annotation){
        let level = this.getLevelDetails(levelName, annotation);
        level.items.forEach(item => {
            let parentId = this.linkHashMap.get(item.id);
            let parents = this.idHashMap.get(parentId);
            // console.log(parentId);
            // console.log(parent);
            console.log(parents);
            if(parents){
                parents.forEach(parent => {
                    if (typeof parent.sampleStart === 'undefined'){
                        parent.sampleStart = item.sampleStart
                        parent.sampleDur = item.sampleDur
                    } else if (item.sampleStart < parent.sampleStart){
                        parent.sampleStart = item.sampleStart;
                    } else if (item.sampleStart + item.sampleDur > parent.sampleStart + parent.sampleDur) {
                        parent.sampleDur = item.sampleStart + item.sampleDur - parent.sampleStart;
                    }                    
                });
            }
        });
    }

    private createIdHashMap(path, annotation){
        this.idHashMap = new Map();
        path.forEach(levelName => {
            let level = this.getLevelDetails(levelName, annotation);
            level.items.forEach(item => {
                this.idHashMap.set(item.id, item);
            });
        });
    }


    private createLinkHashMap(annotation){
        this.linkHashMap = new Map();
        annotation.links.forEach(link => {
            // SIC a child can have muliple parents on different levels
            if(!this.linkHashMap.has(link.toID)){
                this.linkHashMap.set(link.toID, [link.fromID])
            } else {
                let prevParents = this.linkHashMap.get(link.toID);
                this.linkHashMap.set(link.toID, prevParents.push(link.fromID));
            }
        });
    }

    ///////////////////////////
    // private api
    
    /**
     * returns level details by passing in level name
     * if the corresponding level exists
     * otherwise returns 'null'
     *    @param name
     */
    private getLevelDetails(name, annotation) {
        var ret = null;
        annotation.levels.forEach((level) => {
            if (level.name === name) {
                ret = level;
            }
        });
        return ret;
    };

}