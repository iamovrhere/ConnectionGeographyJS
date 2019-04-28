# LinkedIn API

The internal API used by LinkedIn is bound to change. To make it easier to review & update this is what relevant data sources look like as of writing:

* [Profile/Self](#profileself)
* [First Connections](#first-connections)
* [Second Connections](#second-connections)

Noting that outputs are trimmed down to relevant/interested fields.

## Profile/Self

This one isn't strictly an API but rather inline JSON to parsed out of the HTML page.

### Base URL

This will redirect to your profile page if called in the main page.
```
https://www.linkedin.com/in/
```

### Parameters

None needed.

### Headers

* Host: `www.linkedin.com`
* User-Agent: `Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:66.0) Gecko/20100101 Firefox/66.0`
* Accept: `text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8`
* Accept-Language: `en-CA,en-US;q=0.7,en;q=0.3`
* Accept-Encoding: `gzip, deflate, br`
* DNT: `1`
* Connection: `keep-alive`
* Cookie: **Cookie data from document**
* Upgrade-Insecure-Requests: `1`
* Pragma: `no-cache`
* Cache-Control: `no-cache`

### Output

This is a bit trickier than connection data because it gets created as stringified JSON, HTML encoded, and inserted into one of many HTML code blocks. As such, we need to do some preprocessing before we can get this data.

To get this example data:
1. Load the html (not in page)
2. Parse XML/HTML.
3. Cycle through the code blocks and look for `$type": "com.linkedin.voyager.identity.profile.ProfileView"`
4. Take the node and parse as `textContent` to avoid the HTML encoding.
5. Take this string and run `JSON.parse(...)`

```
{
  "data": {
    "$type": "com.linkedin.voyager.identity.profile.ProfileView",
    ...
  },
  "included": [
    {
      "$type": "com.linkedin.voyager.identity.profile.Profile",
      "firstName": "Jason",
      "lastName": "J...",
      "*miniProfile": "urn:li:fs_miniProfile:...",
      "entityUrn": "urn:li:fs_profile:...",
      "headline": "Software Developer at Inc.",
      "summary": "...",
      "industryName": "Computer Software",
      "locationName": "Somewhere, Canada",
      "profilePictureOriginalImage": { // Raw unedited image.
        "artifacts": [
          {
            "width": 600,
            "fileIdentifyingUrlPathSegment": "900_1200/...",
            "height": 900,
            "$type": "com.linkedin.common.VectorArtifact"
          },
          {
            "width": 300,
            "fileIdentifyingUrlPathSegment": "450_600/...",
            "height": 450,
            "$type": "com.linkedin.common.VectorArtifact"
          }
        ],
        "rootUrl": "https://www.linkedin.com/dms/.../profile-originalphoto-shrink_",
        "$type": "com.linkedin.common.VectorImage"
      },
      "defaultLocale": {
        "country": "US",
        "language": "en",
        "$type": "com.linkedin.common.Locale"
      },
      "profilePicture": {
        "displayImage": "urn:li:digitalmediaAsset:...DISPLAY_ID",
        "originalImage": "urn:li:digitalmediaAsset:...ORIGINAL_ID",
        ...
      },
    },
    {
      "$type": "com.linkedin.voyager.identity.shared.MiniProfile"
      "firstName": "Jason",
      "lastName": "J...",
      "occupation": "Software Developer at Inc.",
      "objectUrn": "urn:li:member:12345...",
      "entityUrn": "urn:li:fs_miniProfile:...",
      "backgroundImage": {
        "artifacts": [
          {
            "width": 800,
            "fileIdentifyingUrlPathSegment": "200_800/...",
            "height": 200,
            "$type": "com.linkedin.common.VectorArtifact"
          },
          {
            "width": 1400,
            "fileIdentifyingUrlPathSegment": "350_1400/...",
            "height": 350,
            "$type": "com.linkedin.common.VectorArtifact"
          }
        ],
        "rootUrl": "https://media.licdn.com/dms/image/.../profile-displaybackgroundimage-shrink_",
        "$type": "com.linkedin.common.VectorImage"
      },
      "publicIdentifier": "...",
      "picture": {
        "artifacts": [
          {
            "width": 100,
            "fileIdentifyingUrlPathSegment": "100_100/...",
            "height": 100,
            "$type": "com.linkedin.common.VectorArtifact"
          },
          ... // range is 100, 200, 400, 800
        ],
        "rootUrl": "https://media.licdn.com/dms/image/.../profile-displayphoto-shrink_",
      },
    }
    {
       ...
    },
    ...
  ]
}
```

## First Connections

### Base URL

```
https://www.linkedin.com/voyager/api/search/blended
```

### Parameters

Of importance here is:
* `network->F` to define first connections
* `count` + `start` to define your pagnation.

Encoded values are:
```
count=10
filters=List(network-%3EF,resultType-%3EPEOPLE)
origin=FACETED_SEARCH
q=all
queryContext=List(spellCorrectionEnabled-%3Etrue,relatedSearchesEnabled-%3Etrue,kcardTypes-%3EPROFILE%7CCOMPANY%7CJOB_TITLE)
start=80
```

Which decoded becomes:
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
* csrf-token: `ajax:12345...` matches `JSESSIONID="..."` in cookie.
* x-restli-protocol-version: `2.0.0`
* DNT: `1`
* Connection: `keep-alive`
* Cookie: **Cookie data from document**
* Pragma: `no-cache`
* Cache-Control: `no-cache`

### Output

An important field to note is `"targetUrn": "urn:li:fs_miniProfile:...` which acts as the foreign key to connect records together. It also serves a role in second connection search.

Used `python -m json.tool < example.json > example-pretty.json` to prettify JSON; could use `jq` as well.

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
             "targetUrn": "urn:li:fs_miniProfile:...$FOREIGN_KEY",
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
                   "*miniProfile": "urn:li:fs_miniProfile:...$FOREIGN_KEY",
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
                     "*miniProfile": "urn:li:fs_miniProfile:...other_$FOREIGN_KEY",
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
         "entityUrn": "urn:li:fs_memberBadges:...$FOREIGN_KEY",
         ...
      },
      ... // Mixed content
      {
        "$type": "com.linkedin.voyager.identity.shared.MiniProfile",
        "entityUrn": "urn:li:fs_miniProfile:...$FOREIGN_KEY",
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

## Second Connections

Very Similiar to [First Connections](#first-connections).

### Headers

Same as before but referer is different:
* Referer: `https://www.linkedin.com/search/results/people/?facetConnectionOf=%5B%22$TARGET_URN%22%5D&facetNetwork=%5B%22S%22%5D&origin=FACETED_SEARCH&page=52`
  * Decoded this looks like: `https://www.linkedin.com/search/results/people/?facetConnectionOf=[\"$TARGET_URN\"]&facetNetwork=[\"S\"]&origin=FACETED_SEARCH&page=52`

### Parameters

Mostly same as before but the key differences here are:
* `network->S` defines it as second connections **only**
* `connectionOf->$TARGET_URN` defines the person who you are connected to. This value is just the id and not the URI before it defining the type. Example: in `urn:li:fs_miniProfile:Abcd1234...` we only use `Abcd1234...`.

Encoded values are:
```
count=10
filters=List(network-%3ES,connectionOf-%3E$TARGET_URN,resultType-%3EPEOPLE)
origin=FACETED_SEARCH
q=all
queryContext=List(spellCorrectionEnabled-%3Etrue,relatedSearchesEnabled-%3Etrue,kcardTypes-%3EPROFILE%7CCOMPANY%7CJOB_TITLE)
start=0
```

Decoded values:
```
count=10
filters=List(network->S,connectionOf->$TARGET_URN,resultType->PEOPLE)
origin=FACETED_SEARCH
queryContext=List(spellCorrectionEnabled->true,relatedSearchesEnabled->true,kcardTypes->PROFILE|COMPANY|JOB_TITLE)
start=0
```

### Output

Same as [First Connections](#first-connections).
