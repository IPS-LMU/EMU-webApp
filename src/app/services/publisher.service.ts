import * as angular from 'angular';

export class PublisherService {
    
    
    //////////////////////////////////////////
    private $log;
    private SsffDataService;
    private SsffParserService;
    private BinaryDataManipHelperService;
    private ValidationService;
    private DataService;
    private StandardFuncsService;
    private LoadedMetaDataService;
    private ConfigProviderService;
    

    constructor($log, SsffDataService, SsffParserService, BinaryDataManipHelperService, ValidationService, DataService, StandardFuncsService, LoadedMetaDataService, ConfigProviderService){
        this.$log = $log;
        this.SsffDataService = SsffDataService;
        this.SsffParserService = SsffParserService;
        this.BinaryDataManipHelperService = BinaryDataManipHelperService;
        this.ValidationService = ValidationService;
        this.DataService = DataService;
        this.StandardFuncsService = StandardFuncsService;
        this.LoadedMetaDataService = LoadedMetaDataService;
        this.ConfigProviderService = ConfigProviderService;
    }

    
    public async publishUnsavedBundleToParentWindow() {
        if (this.ConfigProviderService.vals.main.comMode !== 'EMBEDDED') {
            return;
        }

        //create bundle json
        var bundleData = {} as any;

        // ssffFiles (only FORMANTS are allowed to be manipulated so only this track is sent back to server)
        bundleData.ssffFiles = [];
        var formants = this.SsffDataService.getFile('FORMANTS');
        if (formants !== undefined) {
            try {
                let messParser = await this.SsffParserService.asyncJso2ssff(formants);
                bundleData.ssffFiles.push({
                    'fileExtension': formants.fileExtension,
                    'encoding': 'BASE64',
                    'data': this.BinaryDataManipHelperService.arrayBufferToBase64(messParser.data)
                });
            } catch (error) {
                this.$log.warn('Error converting FORMANTS javascript object to SSFF file.', error);
                return;
            }
        }

        // Validate annotation before publishing
        var validRes = this.ValidationService.validateJSO('annotationFileSchema', this.DataService.getData());
        if (validRes !== true) {
            this.$log.warn('PROBLEM: trying to publish bundle to parent window, but bundle is invalid (posssibly because hierarchy view is open). traverseAndClean() will be called.');
        }
        
        // clean annot data just to be safe...
        this.StandardFuncsService.traverseAndClean(this.DataService.getData());

        
        ////////////////////////////
        // construct bundle
        
        // annotation
        bundleData.annotation = this.DataService.getData();
        
        // empty media file (depricated since schema was updated)
        bundleData.mediaFile = {'encoding': 'BASE64', 'data': ''};
        
        var curBndl = this.LoadedMetaDataService.getCurBndl();
        
        // add session if available
        if (typeof curBndl.session !== 'undefined') {
            bundleData.session = curBndl.session;
        }
        // add finishedEditing if available
        if (typeof curBndl.finishedEditing !== 'undefined') {
            bundleData.finishedEditing = curBndl.finishedEditing;
        }
        // add comment if available
        if (typeof curBndl.comment !== 'undefined') {
            bundleData.comment = curBndl.comment;
        }
        
        // validate bundle
        validRes = this.ValidationService.validateJSO('bundleSchema', bundleData);
        
        if (validRes !== true) {
            this.$log.error('GRAVE PROBLEM: trying to publish bundle to parent window, but bundle is invalid. traverseAndClean() HAS ALREADY BEEN CALLED.');
            this.$log.error(validRes);
            this.$log.error('Not publishing!');
            return;
        } else {
            window.parent.postMessage({
                trigger: "autoSave",
                data: bundleData,
            }, '*');
            this.$log.info('Posted to parent (autoSave)', bundleData);
        }
    };
}

angular.module('emuwebApp')
.service('PublisherService', ['$log', 'SsffDataService', 'SsffParserService', 'BinaryDataManipHelperService', 'ValidationService', 'DataService', 'StandardFuncsService', 'LoadedMetaDataService', 'ConfigProviderService', PublisherService])
