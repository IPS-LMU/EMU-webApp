
import { ILevel } from '../interfaces/annot-json.interface';

export class HierarchyWorker {
    private idHashMap: any;
    private linkSubToSuperHashMap: any;
    private linkSuperToSubHashMap: any;
    ///////////////////////////
    // public api
    constructor() {
    }
    
    
    
    public reduceAnnotationToViewableTimeAndPath(annotation, path, viewPortStartSample, viewPortEndSample) {
        
        this.idHashMap = undefined; // reset 4       
        this.linkSubToSuperHashMap = undefined; 
        this.createIdHashMapForPath(path, annotation);
        this.createLinkSubToSuperHashMap(annotation); // from child to parents
        
        let childLevel = this.reduceToItemsWithTimeInView(annotation, path, viewPortStartSample, viewPortEndSample);
        
        // clone and empty annotation
        let annotationClone = JSON.parse(JSON.stringify(annotation));
        annotationClone.levels = [];
        annotationClone.levels.push(JSON.parse(JSON.stringify(childLevel)));
        annotationClone.links = [];
        let reachedTargetLevel = false;
        path.forEach((ln, lnIdx) => {
            if(ln !== path[path.length - 1]){
                if(ln !== path[path.length - 1]){
                    let parentLevelClone = JSON.parse(JSON.stringify(this.getLevelDetails(path[lnIdx + 1], annotation)));
                    parentLevelClone.items = [];
                    
                    this.giveTimeToParentsAndAppendItemsAndLinks(annotationClone, parentLevelClone, childLevel);
                    annotationClone.levels.push(parentLevelClone);
                    childLevel = annotationClone.levels[annotationClone.levels.length - 1];
                    
                }
            }
        });
        
        return annotationClone;
    }
    
    /**
    * returns level details by passing in level name
    * if the corresponding level exists
    * otherwise returns 'null'
    *    @param name
    */
    public getLevelDetails(name, annotation) {
        var ret = null;
        annotation.levels.forEach((level) => {
            if (level.name === name) {
                ret = level;
            }
        });
        return ret;
    };

    /**
     * 
     * @param annotation annotation to guess LinkDefinitions from
     */
    public guessLinkDefinitions (annotation){
        // console.log(annotation)
        this.idHashMap = undefined; // reset 4       
        this.linkSubToSuperHashMap = undefined; 
        this.createIdHashMapForEveryLevel(annotation);
        this.createLinkSubToSuperHashMap(annotation); // from child to parents
        this.createLinkSuperToSubHashMap(annotation); // from parent to children
        // console.log(this.idHashMap);
        // console.log(this.linkSubToSuperHashMap);
        // console.log(this.linkSuperToSubHashMap);
        let linkDefsSuperToSub = this.findAllLinkDefs(this.linkSuperToSubHashMap, false);
        let linkDefsSubToSuper = this.findAllLinkDefs(this.linkSubToSuperHashMap, true);
        
        // console.log(linkDefsSuperToSub);
        // console.log(linkDefsSubToSuper);
        linkDefsSuperToSub.forEach((linkDefSuperToSub) => {
            linkDefsSubToSuper.forEach((linkDefSubToSuper) => {
                if(linkDefSuperToSub.superlevelName === linkDefSubToSuper.superlevelName && linkDefSuperToSub.sublevelName === linkDefSubToSuper.sublevelName){
                    if(linkDefSuperToSub.type === "ONE_TO_ONE"){
                        linkDefSuperToSub.type = linkDefSubToSuper.type;
                    } else if(linkDefSuperToSub.type === "ONE_TO_MANY" && linkDefSubToSuper.type === "MANY_TO_MANY"){
                        linkDefSuperToSub.type = linkDefSubToSuper.type;
                    }
                }
            })
        });
        return(linkDefsSuperToSub);
        
    }
    
    ///////////////////////////
    // private api
    
    private reduceToItemsWithTimeInView(annotation, path, viewPortStartSample, viewPortEndSample){
        let subLevelWithTime = this.getLevelDetails(path[0], annotation);
        let subLevelWithTimeClone = JSON.parse(JSON.stringify(subLevelWithTime));
        subLevelWithTimeClone.items = [];
        // let itemsInView = [];
        subLevelWithTime.items.forEach(item => {
            if(item.sampleStart + item.sampleDur > viewPortStartSample && item.sampleStart < viewPortEndSample){
                subLevelWithTimeClone.items.push(item)
            }
        });
        return subLevelWithTimeClone;
        
    }
    
    private giveTimeToParentsAndAppendItemsAndLinks(annotation, parentLevel, childLevel){
        
        childLevel.items.forEach(item => {
            let parentIds = this.linkSubToSuperHashMap.get(item.id);
            if(typeof parentIds !== 'undefined'){
                parentIds.forEach(parentId => {
                    let parentItem = this.idHashMap.get(parentId);
                    // console.log(parentId);
                    // console.log(parentItem);
                    if(typeof parentItem !== 'undefined'){ // as only levels in path are in idHashMap 
                        if(parentItem.labels[0].name === parentLevel.name){
                            // append link
                            annotation.links.push(
                                {
                                    fromID: parentId,
                                    toID: item.id
                                });
                                // add time info
                                if (typeof parentItem.sampleStart === 'undefined'){
                                    parentItem.sampleStart = item.sampleStart
                                    parentItem.sampleDur = item.sampleDur
                                } else if (item.sampleStart < parentItem.sampleStart){
                                    parentItem.sampleStart = item.sampleStart;
                                } else if (item.sampleStart + item.sampleDur > parentItem.sampleStart + parentItem.sampleDur) {
                                    parentItem.sampleDur = item.sampleStart + item.sampleDur - parentItem.sampleStart;
                                }                    
                                // append item
                                parentLevel.items.push(parentItem);
                                
                            }
                        }
                        // check if parent is on right level
                        
                    });
                }
            })
            
        }
        
        private giveTimeToParents(levelName, annotation, subLevelWithTime){
            let level;
            if(levelName === subLevelWithTime.name){
                level = subLevelWithTime;
            }else{
                level = this.getLevelDetails(levelName, annotation);
            }
            level.items.forEach(item => {
                let parentId = this.linkSubToSuperHashMap.get(item.id);
                let parents = this.idHashMap.get(parentId);
                
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
        
        private createIdHashMapForPath(path, annotation){
            this.idHashMap = new Map();
            path.forEach(levelName => {
                let level = this.getLevelDetails(levelName, annotation);
                level.items.forEach(item => {
                    this.idHashMap.set(item.id, item);
                });
            });
        }
        
        private createIdHashMapForEveryLevel(annotation){
            this.idHashMap = new Map();
            annotation.levels.forEach(level => {
                level.items.forEach(item => {
                    this.idHashMap.set(item.id, item);
                });
            });
        }

        
        private createLinkSubToSuperHashMap(annotation){
            this.linkSubToSuperHashMap = new Map();
            annotation.links.forEach(link => {
                if(!this.linkSubToSuperHashMap.has(link.toID)){
                    this.linkSubToSuperHashMap.set(link.toID, [link.fromID])
                } else {
                    let prevParents = this.linkSubToSuperHashMap.get(link.toID);
                    prevParents.push(link.fromID);
                    this.linkSubToSuperHashMap.set(link.toID, prevParents);
                }
            });
        }

        private createLinkSuperToSubHashMap(annotation){
            this.linkSuperToSubHashMap = new Map();
            annotation.links.forEach(link => {
                if(!this.linkSuperToSubHashMap.has(link.fromID)){
                    this.linkSuperToSubHashMap.set(link.fromID, [link.toID])
                } else {
                    let prevChildren = this.linkSuperToSubHashMap.get(link.fromID);
                    prevChildren.push(link.toID);
                    this.linkSuperToSubHashMap.set(link.fromID, prevChildren);
                }
            });
        }

        // private walkAndAppendToLinkDefinitions(key, path, foundPaths, linkHashMap){
        //     // add to path only if we havn't visited it yet
        //     let item = this.idHashMap.get(key);
        //     let curLevelName = item.labels[0].name;
        //     if(!path.includes(curLevelName)){
        //         path.push(curLevelName);
        //     }
        //     // get values
        //     let values = linkHashMap.get(key);

        //     if(typeof values !== "undefined"){
        //         values.forEach((connectedItemId) => {
        //             // let item = this.idHashMap.get(connectedItemId);
        //             // path.push(item.labels[0].name);
        //             this.walkAndAppendToLinkDefinitions(connectedItemId, path, foundPaths, linkHashMap);
        //         })
        //     } else {
        //         // reached end of path 
        //         // -> append to foundPaths + reset path
        //         // foundPaths.push(path.join(' → '));
        //         // path = [];
        //     }
        // }

        // probably should move this to service
        // private onlyUnique(value, index, self) { 
        //     return self.indexOf(value) === index;
        // }

        private findAllLinkDefs(linkHashMap, reverse){
            // console.log("in findAllLinkDefs");

            let foundLinkDefs = [];
            let foundLinkDefStrings = [];
            // loop through map
            linkHashMap.forEach((values, key, map) => {
                let connectedLevels = [];
                // if([173].indexOf(key) !== -1) { // only start at 8 for now

                let startItem = this.idHashMap.get(key);
                let startLevelName = startItem.labels[0].name;
                // console.log("startLevelName:", startLevelName);
                // console.log("key:", key);
                // console.log("values:", values);
                // console.log("map:", map);

                values.forEach((connectedItemId) => {
                    let connectedItem = this.idHashMap.get(connectedItemId);
                    let connectedItemLevelName = connectedItem.labels[0].name;       
                    let linkDefType;
                    // console.log("connectedItemLevelName:", connectedItemLevelName);
                    if(connectedLevels.indexOf(connectedItemLevelName) === -1){
                        connectedLevels.push(connectedItemLevelName);
                        linkDefType = "ONE_TO_ONE";
                    } else {
                        if(!reverse){
                            linkDefType = "ONE_TO_MANY";
                        } else {
                            linkDefType = "MANY_TO_MANY";
                        }
                    }
                    // this also depends on reverse
                    let linkDefString = startLevelName + ' → ' + connectedItemLevelName;
                    // console.log(linkDefString);
                    if(foundLinkDefStrings.indexOf(linkDefString) === -1){
                        foundLinkDefStrings.push(linkDefString);
                        if(!reverse){
                            foundLinkDefs.push({
                                type: linkDefType,
                                superlevelName: startLevelName,
                                sublevelName: connectedItemLevelName
                            });
                        } else {
                            foundLinkDefs.push({
                                type: linkDefType,
                                superlevelName: connectedItemLevelName,
                                sublevelName: startLevelName
                            });
                        }
                    } else {
                        // update type (only in upgradable direction)
                        if (foundLinkDefs[foundLinkDefStrings.indexOf(linkDefString)].type === "ONE_TO_ONE") {
                            foundLinkDefs[foundLinkDefStrings.indexOf(linkDefString)].type = linkDefType;
                        } else if (foundLinkDefs[foundLinkDefStrings.indexOf(linkDefString)].type === "ONE_TO_MANY" && linkDefType === "MANY_TO_MANY"){
                            foundLinkDefs[foundLinkDefStrings.indexOf(linkDefString)].type = linkDefType;
                        }
                    }
                })
                // }
            })

            // console.log("------------");
            // console.log(foundLinkDefStrings);
            // console.log(foundLinkDefs); // foundLinkDefs.filter(this.onlyUnique)
            return(foundLinkDefs);

        }
        
    }