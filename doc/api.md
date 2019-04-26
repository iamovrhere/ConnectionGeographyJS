# LinkedIn API

The internal API used by LinkedIn for is bound to change. However, to make it easier to review, update this is what it looks like as of writing:

## First Connections

### Base URL
```
https://www.linkedin.com/voyager/api/search/blended
```

### Parameters
The encoded values are:
```
count=10
filters=List(network-%3EF,resultType-%3EPEOPLE)
origin=FACETED_SEARCH
q=all
queryContext=List(spellCorrectionEnabled-%3Etrue,relatedSearchesEnabled-%3Etrue,kcardTypes-%3EPROFILE%7CCOMPANY%7CJOB_TITLE)
start=80
```

Which if decoded become:
```
count=10
filters=List(network->F,resultType->PEOPLE)
origin=FACETED_SEARCH
q=all
queryContext=List(spellCorrectionEnabled->true,relatedSearchesEnabled->true,kcardTypes->PROFILE|COMPANY|JOB_TITLE)
start=80
```

### Headers
Most of these may not be required, the key ones are the cookie and Cross-Site Request Forgery (csrf) token.
* Host: `www.linkedin.com`
* User-Agent: `Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:66.0) Gecko/20100101 Firefox/66.0`
* Accept: `application/vnd.linkedin.normalized+json+2.1`
* Accept-Language: `en-CA,en-US;q=0.7,en;q=0.3`
* Accept-Encoding: `gzip, deflate, br`
* Referer: `https://www.linkedin.com/search/results/people/?facetNetwork=%5B%22F%22%5D&origin=FACETED_SEARCH&page=8`
* x-li-lang: `en_US`
* x-li-track: `{"clientVersion":"1.3.56","osName":"web","timezoneOffset":-6,"deviceFormFactor":"DESKTOP","mpName":"voyager-web"}`
* x-li-page-instance: `urn:li:page:d_flagship3_search_srp_people;...`
* csrf-token: Matches `JSESSIONID="..."` in cookie.
* x-restli-protocol-version: `2.0.0`
* DNT: `1`
* Connection: `keep-alive`
* Cookie: `Cookie info`
* Pragma: `no-cache`
* Cache-Control: `no-cache`

### Output
This is trimmed down to relevant/interested fields. 

An important field to note is `"targetUrn": "urn:li:fs_miniProfile:...` which acts as the binding agent/foreign key to connect records together. It also serves a role in second connection search.

```
{
  "data" : {
    "elements": [
       {
         "$type": "com.linkedin.voyager.search.BlendedSearchCluster",
         "type": "SEARCH_HITS",
         "elements": [
           {
             "$type": "com.linkedin.voyager.search.SearchHitV2",
             "type": "PROFILE",
             "targetUrn": "urn:li:fs_miniProfile:...BINDING_AGENT",
             "subline": {
               "$type": "com.linkedin.voyager.common.TextViewModel",
               "text": "City, Area",
               "textDirection": "FIRST_STRONG"
             },
             "title": {
               "$type": "com.linkedin.voyager.common.TextViewModel",
               "text": "Firstname Lastname",
               "textDirection": "FIRST_STRONG"
             },
             "trackingId": "...",
             "trackingUrn": "urn:li:member:123456789",
             "socialProofText": "5 shared connections",
             "headline": {
               "$type": "com.linkedin.voyager.common.TextViewModel",
               "text": "Headline under name - Software Developer"
               "textDirection": "FIRST_STRONG"
             },
             "image": {
               "$type": "com.linkedin.voyager.common.ImageViewModel",
               "accessibilityTextAttributes": [],
               "attributes": [
                 {
                   "$type": "com.linkedin.voyager.common.ImageAttribute",
                   "*miniProfile": "urn:li:fs_miniProfile:...BINDING_AGENT",
                   "sourceType": "PROFILE_PICTURE"
                 }
               ]
             },
             "memberDistance": {
               "$type": "com.linkedin.voyager.common.MemberDistance",
               "value": "DISTANCE_1"
             },
             "publicIdentifier": "linkedinprofilename",
             "secondaryTitle": {
               "$type": "com.linkedin.voyager.common.TextViewModel",
               "text": "1st",
               "textDirection": "USER_LOCALE"
             },
             "socialProofImagePile": [
               {
                 "$type": "com.linkedin.voyager.common.ImageViewModel",
                 "attributes": [
                   {
                     "$type": "com.linkedin.voyager.common.ImageAttribute",
                     "*miniProfile": "urn:li:fs_miniProfile:...other_BINDING_AGENT",
                     "sourceType": "PROFILE_PICTURE"
                   }
                 ]
               },
               ...
             ],
           },
           ...
         ],
       },
    ],
    "metadata": {
      "$type": "com.linkedin.voyager.search.BlendedSearchMetadata",
      "numVisibleResults": 10,
      "origin": "FACETED_SEARCH",
      "totalResultCount": 1234
    },
    "paging": {
      "count": 10,
      "links": [],
      "start": 80,
      "total": 1234
    }
  }
    "included": [
      {
         "$type": "com.linkedin.voyager.identity.profile.MemberBadges",
         "entityUrn": "urn:li:fs_memberBadges:...BINDING_AGENT",
         ...
      },
      ... // Mixed content
      {
        "$type": "com.linkedin.voyager.identity.shared.MiniProfile",
        "entityUrn": "urn:li:fs_miniProfile:...BINDING_AGENT",
        "objectUrn": "urn:li:member:123456789",
        "firstName": "...",
        "lastName": "...",
        "occupation": "...",
        "publicIdentifier": "linkedinprofilename",
        "backgroundImage": { // can be null
	   "$type": "com.linkedin.common.VectorImage",
           "rootUrl": "https://media.licdn.com/dms/image/.../profile-displaybackgroundimage-shrink_",
           "artifacts": [
              {
                "$type": "com.linkedin.common.VectorArtifact",
		"fileIdentifyingUrlPathSegment": "200_800/...",
                "height": 200,
                "width": 800,
                ...
              },
              {
                "$type": "com.linkedin.common.VectorArtifact",
		"fileIdentifyingUrlPathSegment": "350_1400/...",
                ...
              }
           ]
        },
        "picture": {
	   "$type": "com.linkedin.common.VectorImage",
           "rootUrl": "https://media.licdn.com/dms/image/.../profile-displayphoto-shrink_",
           "artifacts": [
              {
                "$type": "com.linkedin.common.VectorArtifact",
		"fileIdentifyingUrlPathSegment": "100_100/...",
                "height": 100,
                "width": 100,
                ...
              },
              {
                "$type": "com.linkedin.common.VectorArtifact",
		"fileIdentifyingUrlPathSegment": "200_200/...",
                ...
              },
              ... // range is 100, 200, 400, 800
           ]
        },
      }  
    ]
  }
}
```
