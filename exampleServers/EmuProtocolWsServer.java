package exampleServers;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.StringReader;
import java.util.Base64;
import java.util.UUID;
import javax.json.*;
import javax.json.stream.JsonParsingException;
import javax.websocket.OnMessage;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

/**
 * Web-socket endpoint that emulates the EMU-SDMS server. A Java web app container such as Apache
 * Tomcat will automatically map requests to the path specified by the <code>@ServerEndpoint</code>
 * annotation to this class.
 *
 * <p>The endpoint implements the server side of the <a
 * href="https://github.com/IPS-LMU/EMU-webApp/blob/master/dist/manual/EMU-webAppWebsocketProtocol/EMU-webApp-websocket-protocol-0_0_2.md">
 * EMU-webApp websocket protocol</a>.
 *
 * <p><em>NB:</em> All methods are essentially stubs that need implementation filling in.
 *
 * <p>Compilation requires some version of websocket-api.jar and javax.json.jar to be on
 * the classpath.
 *
 * @author Robert Fromont robert.fromont@canterbury.ac.nz
 */
@ServerEndpoint("/emu")
public class EmuProtocolWsServer {

  /**
   * Handle a text message received from the websocket client.
   *
   * @param session The socket session.
   * @param msg The message received.
   * @param last
   */
  @OnMessage
  public void message(Session session, String msg, boolean last) {
    System.out.println("EmuProtocolWsServer request: " + msg);
    String callbackID = "";
    try {
      if (session.isOpen()) {
        EmuWebAppRequest request = new EmuWebAppRequest(msg);
        EmuWebAppResponse response = null;
        if (request.type.equals("GETPROTOCOL")) {
          response = GETPROTOCOL(request);
        } else if (request.type.equals("GETDOUSERMANAGEMENT")) {
          response = GETDOUSERMANAGEMENT(request);
        } else if (request.type.equals("LOGONUSER")) {
          response = LOGONUSER(request);
        } else if (request.type.equals("GETGLOBALDBCONFIG")) {
          response = GETGLOBALDBCONFIG(request);
        } else if (request.type.equals("GETBUNDLELIST")) {
          response = GETBUNDLELIST(request);
        } else if (request.type.equals("GETBUNDLE")) {
          response = GETBUNDLE(request);
        } else if (request.type.equals("SAVEBUNDLE")) {
          response = SAVEBUNDLE(request);
        } else {
          response = new EmuWebAppResponse(request, "ERROR", "Unsupported type: " + request.type);
        }
        System.out.println("EmuProtocolWsServer response: " + response);
        session.getBasicRemote().sendText(response.toString(), last);
      }
    } catch (JsonParsingException e) {
      if (session.isOpen()) {
        try {
          System.out.println("EmuProtocolWsServer ERROR: " + e);
          session
            .getBasicRemote()
            .sendText(new EmuWebAppResponse(null, "ERROR", e.getMessage()).toString(), last);
          
        } catch (IOException exception) {
        }
      }
    } catch (IOException e) {
      try {
        session.close();
      } catch (IOException e1) {
      }
    }
  }

  /**
   * Handler for the GETPROTOCOL request.
   *
   * @param request The incoming request.
   * @return The response to the request.
   */
  public EmuWebAppResponse GETPROTOCOL(EmuWebAppRequest request) {
    return new EmuWebAppResponse(
      request, Json.createObjectBuilder()
      .add("protocol", "EMU-webApp-websocket-protocol")
      .add("version", "0.0.2"));
  } // end of GETPROTOCOL()

  /**
   * Handler for the GETDOUSERMANAGEMENT request.
   *
   * @param request The incoming request.
   * @return The response to the request.
   */
  public EmuWebAppResponse GETDOUSERMANAGEMENT(EmuWebAppRequest request) {
    return new EmuWebAppResponse(request, "NO"); // or YES, if you prefer...
  } // end of GETDOUSERMANAGEMENT()

  /**
   * Handler for the LOGONUSER request.
   *
   * @param request The incoming request.
   * @return The response to the request.
   */
  public EmuWebAppResponse LOGONUSER(EmuWebAppRequest request) {
    JsonObject data = request.jsonObject.getJsonObject("data");
    String userName = data.getString("userName");
    String pwd = data.getString("pwd");
    // TODO Actually check credentials...
    return new EmuWebAppResponse(request, "LOGGEDON");
  } // end of LOGONUSER()
  
  /**
   * Handler for the GETGLOBALDBCONFIG request.
   *
   * @param request The incoming request.
   * @return The response to the request.
   */
  public EmuWebAppResponse GETGLOBALDBCONFIG(EmuWebAppRequest request) {
    // TODO Actually read/construct the real config...
    JsonObjectBuilder data =
      Json.createObjectBuilder()
      .add("name", "Example")
      .add("UUID", UUID.randomUUID().toString())
      .add("mediafileExtension", "wav")
      .add("ssffTrackDefinitions", Json.createArrayBuilder()
           .add(Json.createObjectBuilder()
                .add("name", "FORMANTS")
                .add("columnName", "fm")
                .add("fileExtension", "fms")))
      .add("levelDefinitions", Json.createArrayBuilder()
           .add(Json.createObjectBuilder()
                .add("name", "utterance")
                .add("type", "SEGMENT")
                .add("attributeDefinitions", Json.createArrayBuilder()
                     .add(Json.createObjectBuilder()
                          .add("name", "utterance")
                          .add("type", "STRING"))))
           .add(Json.createObjectBuilder()
                .add("name", "transcript")
                .add("type", "SEGMENT")
                .add("attributeDefinitions", Json.createArrayBuilder()
                     .add(Json.createObjectBuilder()
                          .add("name", "transcript")
                          .add("type", "STRING")))))
      .add("linkDefinitions", Json.createArrayBuilder())
      .add("EMUwebAppConfig", Json.createObjectBuilder()
           .add("perspectives", Json.createArrayBuilder()
                .add(Json.createObjectBuilder()
                     .add("name", "default")
                     .add("signalCanvases", Json.createObjectBuilder()
                          .add("order", Json.createArrayBuilder().add("OSCI").add("SPEC"))
                          .add("assign", Json.createArrayBuilder()
                               .add(Json.createObjectBuilder()
                                    .add("signalCanvasName", "SPEC")
                                    .add("ssffTrackName", "FORMANTS")))
                          .add("contourLims", Json.createArrayBuilder()
                               .add(Json.createObjectBuilder()
                                    .add("ssffTrackName", "FORMANTS")
                                    .add("minContourIdx", 0)
                                    .add("maxContourIdx", 1))))
                     .add("levelCanvases", Json.createObjectBuilder()
                          .add("order", Json.createArrayBuilder()
                               .add("utterance")
                               .add("transcript")))
                     .add("twoDimCanvases", Json.createObjectBuilder()
                          .add("order", Json.createArrayBuilder()))))
           .add("restrictions", Json.createObjectBuilder()
                .add("showPerspectivesSidebar", true)
                .add("playback", true)
                .add("correctionTool", true)
                .add("editItemSize", true)
                .add("useLargeTextInputField", true))
           .add("activeButtons", Json.createObjectBuilder()
                .add("saveBundle", true)
                .add("showHierarchy", true)));
    return new EmuWebAppResponse(request, data);
  } // end of GETGLOBALDBCONFIG()
  
  /**
   * Handler for the GETBUNDLELIST request.
   *
   * @param request The incoming request.
   * @return The response to the request.
   */
  public EmuWebAppResponse GETBUNDLELIST(EmuWebAppRequest request) {
    // TODO Actually list real bundles...
    JsonArrayBuilder data =
      Json.createArrayBuilder()
      .add(Json.createObjectBuilder()
           .add("name", "example__0.000-6.016")
           .add("session", "000"));
    return new EmuWebAppResponse(request, data);
  } // end of GETBUNDLELIST()

  /**
   * Handler for the GETBUNDLE request.
   *
   * @param request The incoming request.
   * @return The response to the request.
   * @throws IOException If there are problems loading files.
   */
  public EmuWebAppResponse GETBUNDLE(EmuWebAppRequest request) throws IOException {
    String name = request.jsonObject.getString("name");
    String session = request.jsonObject.getString("session");

    // TODO Actually read the real bundle...
    JsonObjectBuilder data =
      Json.createObjectBuilder()
      .add("annotation", Json.createObjectBuilder()
           .add("name", name)
           .add("annotates", "example__0.000-6.016")
           .add("sampleRate", 16000)
           .add("levels", Json.createArrayBuilder()
                .add(Json.createObjectBuilder()
                     .add("name", "utterance")
                     .add("type", "SEGMENT")
                     .add("items", Json.createArrayBuilder()
                          .add(Json.createObjectBuilder()
                               .add("id", 0)
                               .add("sampleStart", 0)
                               .add("sampleDur", 96255)
                               .add("labels", Json.createArrayBuilder()
                                    .add(Json.createObjectBuilder()
                                         .add("name", "utterance")
                                         .add("value", "and . walk about oh -"))))))
                .add(Json.createObjectBuilder()
                     .add("name", "transcript")
                     .add("type", "SEGMENT")
                     .add("items", Json.createArrayBuilder()
                          .add(Json.createObjectBuilder()
                               .add("id", 1)
                               .add("sampleStart", 0)
                               .add("sampleDur", 4319)
                               .add("labels", Json.createArrayBuilder()
                                    .add(Json.createObjectBuilder()
                                         .add("name", "transcript")
                                         .add("value", ""))))
                          .add(Json.createObjectBuilder()
                               .add("id", 2)
                               .add("sampleStart", 4320)
                               .add("sampleDur", 4959)
                               .add("labels", Json.createArrayBuilder()
                                    .add(Json.createObjectBuilder()
                                         .add("name", "transcript")
                                         .add("value", "and ."))))
                          .add(Json.createObjectBuilder()
                               .add("id", 3)
                               .add("sampleStart", 9280)
                               .add("sampleDur", 6719)
                               .add("labels", Json.createArrayBuilder()
                                    .add(Json.createObjectBuilder()
                                         .add("name", "transcript")
                                         .add("value", ""))))
                          .add(Json.createObjectBuilder()
                               .add("id", 4)
                               .add("sampleStart", 16000)
                               .add("sampleDur", 4959)
                               .add("labels", Json.createArrayBuilder()
                                    .add(Json.createObjectBuilder()
                                         .add("name", "transcript")
                                         .add("value", "walk"))))
                          .add(Json.createObjectBuilder()
                               .add("id", 5)
                               .add("sampleStart", 20960)
                               .add("sampleDur", 9919)
                               .add("labels", Json.createArrayBuilder()
                                    .add(Json.createObjectBuilder()
                                         .add("name", "transcript")
                                         .add("value", "about"))))
                          .add(Json.createObjectBuilder()
                               .add("id", 6)
                               .add("sampleStart", 30880)
                               .add("sampleDur", 4159)
                               .add("labels", Json.createArrayBuilder()
                                    .add(Json.createObjectBuilder()
                                         .add("name", "transcript")
                                         .add("value", "oh -"))))
                          .add(Json.createObjectBuilder()
                               .add("id", 7)
                               .add("sampleStart", 35040)
                               .add("sampleDur", 61215)
                               .add("labels", Json.createArrayBuilder()
                                    .add(Json.createObjectBuilder()
                                         .add("name", "transcript")
                                         .add("value", "")))))))
           .add("links", Json.createArrayBuilder()))
      .add("mediaFile", Json.createObjectBuilder()
           .add("encoding", "BASE64")
           // TODO replace the following with something like:
           // TODO base64Encode(new FileInputStream(pathToWavFile))
           .add("data", base64Encode(getClass().getResource("audio.wav").openStream()))) 
      .add("ssffFiles", Json.createArrayBuilder());
    
    return new EmuWebAppResponse(request, data);
  } // end of GETBUNDLE()

  /**
   * Handler for the SAVEBUNDLE request.
   *
   * @param request The incoming request.
   * @return The response to the request.
   * @throws IOException If there are problems loading files.
   */
  public EmuWebAppResponse SAVEBUNDLE(EmuWebAppRequest request) throws IOException {
    JsonObject bundleData = request.jsonObject.getJsonObject("data");
    // TODO Actually save the data...
    return new EmuWebAppResponse(request, "SUCCESS", "");
  } // end of SAVEBUNDLE()
  
  /**
   * Encodes the given content as a BASE64-encoded string.
   *
   * @param content The content to encode.
   * @return A BASE64-encoded representation of the content.
   * @throws IOException If an IO error occurs.
   */
  private String base64Encode(InputStream content) throws IOException {
    ByteArrayOutputStream base64Out = new ByteArrayOutputStream();
    OutputStream bytesOut = Base64.getEncoder().wrap(base64Out);
    byte[] buffer = new byte[1024];
    int byteCount = content.read(buffer);
    while (byteCount >= 0) {
      bytesOut.write(buffer, 0, byteCount);
      byteCount = content.read(buffer);
    } // read next chunk
    content.close();
    bytesOut.close();
    return base64Out.toString();
  } // end of base64EncodeFile()

  /** Convenience class for wrapping requests and making common attributes accessible. */
  static class EmuWebAppRequest {
    final JsonObject jsonObject;
    /**
     * The request type; one of "GETPROTOCOL", "GETDOUSERMANAGEMENT", "LOGONUSER",
     * "GETGLOBALDBCONFIG", "GETBUNDLELIST", "GETBUNDLE", "SAVEBUNDLE", and "DISCONNECTWARNING".
     */
    String type;
    /** The request's callbackID. */
    String callbackID;
    /** The "data" attribute, if any. */
    JsonObject data;
    
    /**
     * Constructor from a JSON string.
     *
     * @param jsonString The request expressed as a JSON string.
     * @throws JsonException If a JSON object cannot be created due to i/o error.
     * @throws JsonParsingException If a JSON object cannot be created due to incorrect
     *     representation.
     * @throws IllegalStateException If read, readObject, readArray or close method is already
     *     called.
     */
    public EmuWebAppRequest(String jsonString)
      throws JsonException, JsonParsingException, IllegalStateException {
      JsonReader jsonReader = Json.createReader(new StringReader(jsonString));
      jsonObject = jsonReader.readObject();
      type = jsonObject.getString("type");
      callbackID = jsonObject.getString("callbackID");
      if (jsonObject.containsKey("data")) {
        data = jsonObject.getJsonObject("data");
      }
    } // end of constructor
  } // end of class EmuWebAppRequest
  
  /** Convenience class for wrapping responses. */
  static class EmuWebAppResponse {
    final JsonObject jsonObject;
    
    /**
     * Constructor with basic attributes.
     *
     * @param request The request that this is a response to.
     * @param type One of "ERROR" or "SUCCESS".
     * @param message A message.
     */
    public EmuWebAppResponse(EmuWebAppRequest request, String type, String message) {
      jsonObject =
        Json.createObjectBuilder()
        .add("callbackID", request == null ? "" : request.callbackID)
        .add("status", Json.createObjectBuilder()
             .add("type", type)
             .add("message", message == null ? "" : message))
        .build();
    } // end of constructor
    
    /**
     * Constructor with a data object. <var>status.type</var> is set to "SUCCESS", and
     * <var>status.message</var> to and empty string.
     *
     * @param request The request that this is a response to.
     * @param data The data to return to the client.
     */
    public EmuWebAppResponse(EmuWebAppRequest request, JsonObjectBuilder data) {
      jsonObject = Json.createObjectBuilder()
        .add("callbackID", request == null ? "" : request.callbackID)
        .add("status", Json.createObjectBuilder().add("type", "SUCCESS").add("message", ""))
        .add("data", data)
        .build();
    } // end of constructor

    /**
     * Constructor with a data object. <var>status.type</var> is set to "SUCCESS", and
     * <var>status.message</var> to and empty string.
     *
     * @param request The request that this is a response to.
     * @param data The data to return to the client.
     */
    public EmuWebAppResponse(EmuWebAppRequest request, JsonArrayBuilder data) {
      jsonObject = Json.createObjectBuilder()
        .add("callbackID", request == null ? "" : request.callbackID)
        .add("status", Json.createObjectBuilder().add("type", "SUCCESS").add("message", ""))
        .add("data", data)
        .build();
    } // end of constructor

    /**
     * Constructor with a data string. <var>status.type</var> is set to "SUCCESS", and
     * <var>status.message</var> to and empty string.
     *
     * @param request The request that this is a response to.
     * @param data The string to return as the "data"attribute.
     */
    public EmuWebAppResponse(EmuWebAppRequest request, String data) {
      jsonObject = Json.createObjectBuilder()
        .add("callbackID", request == null ? "" : request.callbackID)
        .add("status", Json.createObjectBuilder().add("type", "SUCCESS").add("message", ""))
        .add("data", data)
        .build();
    } // end of constructor

    /**
     * Express the response as JSON.
     *
     * @return A JSON-encoded string representing the response.
     */
    public String toString() {
      return jsonObject.toString();
    } // end of toString()
  } // end of class EmuWebAppResponse
} // EmuProtocolWsServer
