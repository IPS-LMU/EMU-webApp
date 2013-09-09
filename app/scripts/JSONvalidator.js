EmuLabeller.JSONvalidator = {

    init: function () {
        this.successObj = {
            "foo" : "bar"
        };

        this.failureObj = {
            "f" : 1234
        };

        //hard coded schema that json has to agree with
        this.schema = {
            "$schema": "http://json-schema.org/draft-03/schema#", // SIC maybe 4 needed... does not work with JSV
            "title": "tierInfos",
            "description": "JSON representation of tier information containing sample times of events with label information",
            "type": "object",
            "properties" : {
                "origSamplerate" : {
                    "description": "sample rate of audio file that this JSON contains the label information of",
                    "type" : "integer"
                },
                "labelEncoding": {
                    "description": "encoding of labels given. Only UTF-8 is supported. So anything else will not work",
                    "type": "string"
                },
                "tiers": {
                    "description":"array containing tier information of multiple tiers",
                    "type":"array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "tierName": {
                                "description": "name of tier which should uniquely specify the tier from others in view",
                                "type": "string"
                            },
                            "tierType": {
                                "description": "type of tier can either be 'seg' to mark a segment tier or 'point' to mark a point/event tier",
                                "type": {"enum": ["seg", "point"]}
                            },
                            "events": {
                                "description": "array containing containing label information of multiple labels",
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "label": {
                                            "description": "an arbitrary UTF-8 string that describes the label",
                                            "type": "string"
                                        },
                                        "atSample": {
                                            "description": "sample that marks the start/point of the event dependent on the type of tier",
                                            "type": "integer"
                                        },
                                        "dur": {
                                            "description": "duration of segment (in tierType seg) where atSample+dur marks the end sample of the segment",
                                            "type": "integer"
                                        }
                                    }
                                }
                            }
                        },
                        "required": ["tierName", "tierType", "events"],
                        "additionalProperties": false
                    }
                }
            },
            "required":["origSamplerate", "labelEncoding"],
            "additionalProperties": false
        };
    },


    validateTierInfos: function () {
        var env = JSV.createEnvironment("json-schema-draft-03");

        var json = this.successObj;

        // if string then should check if is valid json
        // try {
        //     json = json ? JSON.parse(json) : undefined;
        // } catch (e) {
        //     throw new Error("Input is not valid JSON");
        // }

        // try {
        //     schema = schema ? JSON.parse(schema) : undefined;
        // } catch (e) {
        //     throw new Error("Schema is not valid JSON");
        // }


        var report = env.validate("{foo:'bar‘}", this.schema);
        console.log(report);
        console.log(this.failureObj);
        // Check report
        if (report.errors.length === 0) {
            // Success, do something
            console.log("Object is valid! Length of errors: " + report.errors.length);
        } else {
            // Failure - extract the errors array 
            var errorArr = report.errors;
            console.log("uri : " + errorArr[0].uri + "\nmessage :  "  + errorArr[0].message);
        }
    }
};