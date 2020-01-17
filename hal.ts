/*

{
	"_links": {
		"self": {
			"href": "/videos/12345"
		}
	},

	"_forms": {
		"Upload": {
			"action": "/videos/12345/upload",
			"method": "POST",
			"type": "multipart/form-data",
			"fields": [
				{
					"name": "data",
					"type": "file" 
				},
				{
					"name": "id",
					"type": "text"
				}
			]
		}
	},

	"id": "12345",
	"privacy": "PUBLIC",
	"creatorId": "5g9ace1",
	"title": "Meme Vids",
	"description": "This vid is meme as hec",
	"thumbnailURL": "https://cdn.octastream.com/images/g231sa52d",
	"status": "NOT_AVAILABLE"
}

*/

type FIELD_TYPE_TEXT = 'text';
type FIELD_TYPE_NUMBER = 'number';
type FIELD_TYPE_HIDDEN = 'hidden';
type FIELD_TYPE_FILE = 'file';

type FIELD_TYPES = FIELD_TYPE_TEXT | 
	FIELD_TYPE_NUMBER |
	FIELD_TYPE_HIDDEN |
	FIELD_TYPE_FILE;


type MEDIA_TYPE_OCTET = 'application/octet-stream';
type MEDIA_TYPE_JSON = 'application/json';
type MEDIA_TYPE_HAL = 'application/hal+json';
type MEDIA_TYPE_FORM = 'application/x-www-form-urlencoded';
type MEDIA_TYPE_MULTIPART = 'multipart/form-data';
type MEDIA_TYPES = MEDIA_TYPE_MULTIPART | 
					MEDIA_TYPE_FORM |
					MEDIA_TYPE_JSON | 
					MEDIA_TYPE_HAL | 
					MEDIA_TYPE_OCTET;

type HTTP_GET = 'GET';
type HTTP_POST = 'POST';
type HTTP_PUT = 'PUT';
type HTTP_DELETE = 'DELETE';
type HTTP_PATCH = 'PATCH';
type HTTP_METHODS = HTTP_GET | HTTP_POST | HTTP_PUT | HTTP_DELETE | HTTP_PATCH;

interface IFieldObject {
	name: string; // REQUIRED. Name of the field. If empty or missing, client SHOULD ignore this field object completely.
	type: FIELD_TYPES; // REQUIRED. Type of the field.
	required?: boolean; // Defaults to false.
	default?: string | number;
    regex?: RegExp; // A regular expression (HTML 5 pattern) to be applied to the value of the field.
    readonly?: boolean; // Indicates whether the field is read-only. Defaults to false.
}

interface IFormObject {
	action: string; // REQURIED. URI pointing to the action
	method: HTTP_METHODS; // REQUIRED.
	type?: MEDIA_TYPES | string; // Default should be application/json
	fields?: IFieldObject[];
}

interface IForm extends IFormObject {
    key: string;
    toJSON: () => any;
}

function Form(this:IForm, key: string, value: IFormObject): void {
	if (!(this instanceof Form)) return new Form(key, value);

	if(!key) throw new Error('Form requires a key');

	this.key = key;

	if (typeof value != 'object') throw new Error('invalid form value');

    if (!value.action) throw new Error('Form action URI is required'); 

    if (!value.method) throw new Error('Form method is requied');

	// TODO check that action and method exist in value
	var expectedFormAttributes = ['action', 'method', 'type', 'fields'];

	// TODO check that field name and type exists
	var expectedFieldAttributes = ['name', 'type', 'required', 'default', 'regex'];

	
	for (var attr in value) {
		if (!~expectedFormAttributes.indexOf(attr)) {
			continue;
		}

		this[attr] = value[attr];
	}
}

Form.prototype.toJSON = function() {
  // Note: calling "JSON.stringify(this)" will fail as JSON.stringify itself calls toJSON()
  // We need to copy properties to a new object
  return Object.keys(this).reduce((function (object, key) {
    object[key] = this[key];
    return object;
  }).bind(this), {});
}

interface ILinkObject {
  href: string;
  templated?: boolean;
  type?: string;
  name?: string;
  profile?: string;
  title?: string;
  hreflang?: string;
}

interface ILink extends ILinkObject {
    rel: string;
    toJSON: () => any;
    toXML: () => string;
}

/**
 * Link to another hypermedia
 * @param String rel → the relation identifier
 * @param String|Object value → the href, or the hash of all attributes (including href)
 */
function Link (this:ILink, rel: string, value: string | ILinkObject): void {
  if (!(this instanceof Link)) {
    return new Link(rel, value);
  }

  if (!rel) throw new Error('Required <link> attribute "rel"');

  this.rel = rel;

  if (typeof value === 'object') {

    // If value is a hashmap, just copy properties
    if (!value.href) throw new Error('Required <link> attribute "href"');
    var expectedAttributes = ['rel', 'href', 'name', 'hreflang', 'title', 'templated', 'icon', 'align', 'method'];
    for (var attr in value) {
      if (value.hasOwnProperty(attr)) {
        if (!~expectedAttributes.indexOf(attr)) {
          // Unexpected attribute: ignore it
          continue;
        }
        this[attr] = value[attr];
      }
    }

  } else {

    // value is a scalar: use its value as href
    if (!value) throw new Error('Required <link> attribute "href"');
    this.href = String(value);

  }
}

/**
 * XML representation of a link
 */
Link.prototype.toXML = function () {
  var xml = '<link';
  for (var attr in this) {
    if (this.hasOwnProperty(attr)) {
      xml += ' ' + attr + '="' + escapeXml(this[attr]) + '"';
    }
  }
  xml += ' />';
  return xml;
}

/**
 * JSON representation of a link
 */
Link.prototype.toJSON = function () {
  // Note: calling "JSON.stringify(this)" will fail as JSON.stringify itself calls toJSON()
  // We need to copy properties to a new object
  return Object.keys(this).reduce((function (object, key) {
    object[key] = this[key];
    return object;
  }).bind(this), {});
};


interface IResource {
    _links: { 
        self?: ILink;
        [key: string]: ILink | ILink[];
    }
    _embedded: { [key: string]: IResource[]; }
    _forms: { [key: string]: IForm | IForm[]; }
    href: string;
    link: (link) => IResource;
    [key: string]: any;
}
/**
 * A hypertext resource
 * @param Object object → the base properties
 *                      Define "href" if you choose not to pass parameter "uri"
 *                      Do not define "_links" and "_embedded" unless you know what you're doing
 * @param String uri → href for the <link rel="self"> (can use reserved "href" property instead)
 */
function Resource (this: IResource, object, uri?: string): void {
  // new Resource(resource) === resource
  if (object instanceof Resource) {
    //@ts-ignore
    return object;
  }

  // Still work if "new" is omitted
  if (!(this instanceof Resource)) {
    return new Resource(object, uri);
  }

  // Initialize _links and _embedded properties
  this._links = {};
  this._embedded = {};
  this._forms = {};

  // Copy properties from object
  // we copy AFTER initializing _links and _embedded so that user
  // **CAN** (but should not) overwrite them
  for (var property in object) {
    if (object.hasOwnProperty(property)) {
      this[property] = object[property];
    }
  }

  // Use uri or object.href to initialize the only required <link>: rel = self
  uri = uri || this.href;
  if (uri === this.href) {
    delete this.href;
  }

  // If we have a URI, add this link
  // If not, we won't have a valid object (this may lead to a fatal error later)
  if (uri) this.link(new Link('self', uri));
};

/**
 * Add a link to a resource
 * @param Link link
 *
 * Alternative usage: function (rel, value)
 * @see Link
 */
Resource.prototype.link = function (link): IResource {
  if (arguments.length > 1) {
    link = new Link(arguments[0], arguments[1]);
  }

  if (typeof this._links[link.rel] === "undefined") {
    this._links[link.rel] = link;
  } else if (Array.isArray(this._links[link.rel])) {
    this._links[link.rel].push(link)
  } else {
    this._links[link.rel] = [this._links[link.rel], link]
  }

  return this;
};

Resource.prototype.form = function(key: string, value: IFormObject) {
    let form = new Form(key, value);

    if (typeof this._forms[form.key] === "undefined") {
        this._forms[form.key] = form;
    } else if (Array.isArray(this._forms[form.key])) {
        this._forms[form.key].push(form)
    } else {
        this._forms[form.key] = [this._forms[form.key], form]
    }

    return this;
}

/**
 * Add an embedded resource
 * @param String rel → the relation identifier (should be plural)
 * @param Resource|Resource[] → resource(s) to embed
 */
Resource.prototype.embed = function (rel, resource, pluralize) {
  if (typeof pluralize === 'undefined') pluralize = true;

  // [Naive pluralize](https://github.com/naholyr/js-hal#why-this-crappy-singularplural-management%E2%80%AF)
  if (pluralize && rel.substring(rel.length - 1) !== 's') {
    rel += 's';
  }

  // Initialize embedded container
  if (this._embedded[rel] && !Array.isArray(this._embedded[rel])) {
    this._embedded[rel] = [this._embedded[rel]];
  } else if (!this._embedded[rel]) {
    this._embedded[rel] = [];
  }

  // Append resource(s)
  if (Array.isArray(resource)) {
    this._embedded[rel] = this._embedded[rel].concat(resource.map(function (object) {
      return new Resource(object);
    }));
  } else {
    this._embedded[rel] = new Resource(resource);
  }

  return this;
};

/**
 * Convert a resource to a stringifiable anonymous object
 * @private
 * @param Resource resource
 */
function resourceToJsonObject (resource: IResource) {
  var result:any = {};

  for (var prop in resource) {

    if (prop === '_links') {
        if (Object.keys(resource._links).length > 0) {
        // Note: we need to copy data to remove "rel" property without corrupting original Link object
        result._links = Object.keys(resource._links).reduce(function (links, rel) {
            let _links =resource._links[rel];
            let isArray = (arg): arg is Array<ILink> => Array.isArray(arg);
            
            if (isArray(_links)) {
                
                links[rel] = new Array()
                for (var i=0; i < _links.length; i++)
                    links[rel].push(_links[i].toJSON())

            } else {
                var link = _links.toJSON();
                links[rel] = link;
                delete link.rel;
            }
            return links;
        }, {});
        }

    } else if (prop === '_embedded') {
        if (Object.keys(resource._embedded).length > 0) {
            // Note that we do not reformat _embedded
            // which means we voluntarily DO NOT RESPECT the following constraint:
            // > Relations with one corresponding Resource/Link have a single object
            // > value, relations with multiple corresponding HAL elements have an
            // > array of objects as their value.
            // Come on, resource one is *really* dumb.
            result._embedded = {};
            for (var rel in resource._embedded) {
                result._embedded[rel] = resource._embedded[rel].map(resourceToJsonObject);
            }
        }

    } else if (prop === '_forms') {

        result._forms = Object.keys(resource._forms).reduce((links, rel) => {

            let _forms =resource._forms[rel];
            let isArray = (arg): arg is Array<IForm> => Array.isArray(arg);
            
            if (isArray(_forms)) {
                
                links[rel] = new Array()
                for (var i=0; i < _forms.length; i++)
                    links[rel].push(_forms[i].toJSON())

            } else {
                var link = _forms.toJSON();
                links[rel] = link;
                delete link.rel;
            }
            return links;

            return links;
        }, {});

    } else if (resource.hasOwnProperty(prop)) {
        result[prop] = resource[prop];
    }
  }

  return result;
}

/**
 * JSON representation of the resource
 * Requires "JSON.stringify()"
 * @param String indent → how you want your JSON to be indented
 */
Resource.prototype.toJSON = function (indent) {
  return resourceToJsonObject(this);
};

/**
 * Escape an XML string: encodes double quotes and tag enclosures
 * @private
 */
function escapeXml (string) {
  return String(string).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

/**
 * Convert a resource to its XML representation
 * @private
 * @param Resource resource
 * @param String rel → relation identifier for embedded object
 * @param String currentIdent → current indentation
 * @param String nextIndent → next indentation
 */
function resourceToXml (resource: IResource, rel: string, currentIndent, nextIndent) {
  // Do not add line feeds if no indentation is asked
  var LF = (currentIndent || nextIndent) ? '\n' : '';

  // Resource tag
  var xml = currentIndent + '<resource';

  // Resource attributes: rel, href, name
  if (rel) xml += ' rel="' + escapeXml(rel) + '"';
  if (resource.href || resource._links.self) xml += ' href="' + escapeXml(resource.href || resource._links.self.href) + '"';
  if (resource.name) xml += ' name="' + escapeXml(resource.name) + '"';
  xml += '>' + LF;

  // Add <link> tags
  for (var rel in resource._links) {
    if (!resource.href && rel === 'self') continue;
    xml += currentIndent + nextIndent + (<ILink>resource._links[rel]).toXML() + LF;
  }

  // Add embedded
  for (var embed in resource._embedded) {
    // [Naive singularize](https://github.com/naholyr/js-hal#why-this-crappy-singularplural-management%E2%80%AF)
    var rel = embed.replace(/s$/, '');
    resource._embedded[embed].forEach(function (res) {
      xml += resourceToXml(res, rel, currentIndent + nextIndent, currentIndent + nextIndent + nextIndent) + LF;
    });
  }

  // Add properties as tags
  for (var prop in resource) {
    if (resource.hasOwnProperty(prop) && prop !== '_links' && prop !== '_embedded') {
      xml += currentIndent + nextIndent + '<' + prop + '>' + String(resource[prop]) + '</' + prop + '>' + LF;
    }
  }

  // Close tag and return the shit
  xml += currentIndent + '</resource>';

  return xml;
}

/**
 * XML representation of the resource
 * @param String indent → how you want your XML to be indented
 */
Resource.prototype.toXML = function (indent) {
  return resourceToXml(this, null, '', indent || '');
};

/**
 * Returns the JSON representation indented using tabs
 */
Resource.prototype.toString = function () {
  return this.toJSON('\t');
};

/**
 * Public API
 */

export {
    Resource,
    Link
}