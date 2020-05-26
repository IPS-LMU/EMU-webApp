import * as angular from 'angular';

let OsciOverviewComponent = {
    selector: "osciOverview",
    template: `
    <div class="emuwebapp-preview">
    <canvas width="4096" height="128" class="emuwebapp-preview-canvas" ng-style="backgroundCanvas" id="PreviewCanvas"></canvas>
    <canvas width="4096" height="128" class="emuwebapp-preview-canvas-markup" id="PreviewCanvas" previewtrack></canvas>
    </div>
    `,
    bindings: {

    },
    controller: class OsciOverviewComponent{
        
    }
}