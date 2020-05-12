
import { ILevel } from '../interfaces/annot-json.interface';

export class HierarchyWorker {
    private idHashMap: any;
    private linkHashMap: any;
    ///////////////////////////
    // public api
    constructor() {
    }
    
    
    
    public reduceAnnotationToViewableTimeAndPath(annotation, path, viewPortStartSample, viewPortEndSample) {
        
        this.idHashMap = undefined; // reset 4       
        this.linkHashMap = undefined; 
        this.createIdHashMap(path, annotation);
        this.createLinkHashMap(annotation); // from child to parents
        
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
            let parentIds = this.linkHashMap.get(item.id);
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
                let parentId = this.linkHashMap.get(item.id);
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
                if(!this.linkHashMap.has(link.toID)){
                    this.linkHashMap.set(link.toID, [link.fromID])
                } else {
                    let prevParents = this.linkHashMap.get(link.toID);
                    prevParents.push(link.fromID);
                    this.linkHashMap.set(link.toID, prevParents);
                }
            });
        }
        
    }