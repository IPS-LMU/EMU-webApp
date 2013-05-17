EmuLabeller.JSONvalidator = {

    init: function () {
        // this.load('data/msajc003.f0');
        this.successObj = {
            "foo" : "bar"
        };

        this.failureObj = {
            "foo" : 1234
        };

        this.schema = {
            "type": "object",
            "properties" : {
                "foo" : {
                    "type" : "string"
                }
            }
        };
    },

    validateTierInfos: function () {
        var env = JSV.createEnvironment("json-schema-draft-03"); 

        console.log("weeeeeeee");
    }

};