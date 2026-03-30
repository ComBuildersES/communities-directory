# Changelog

Historial generado automáticamente a partir de los commits del repositorio.
Se organiza por mes y por tipo de cambio.

## 2026-03

### Features

- 2026-03-30 `cffa207` update devcontainer and Vite configuration for improved development setup
- 2026-03-30 `9031b3b` add devcontainer configuration for Alpine environment
- 2026-03-30 `3f078e1` shuffle contributors display and update visible contributors logic
- 2026-03-30 `e19fe3e` Update community data and add new Python and GDG groups with updated images
- 2026-03-30 `15db54c` Add hidden children warning to ParentFilterBanner and update translations
- 2026-03-30 `9cb4756` Enhance CommunityModal with parent network display and update translations
- 2026-03-30 `2676e55` Implement parent-child relationship for communities
- 2026-03-27 `87a9d16` add search placeholder translations for map component feat(App): set document language based on resolved language
- 2026-03-27 `d62161c` add generalist community notes and update translations
- 2026-03-27 `9e1fe76` add conditional inclusion for matchesAllTags and matchesAllAudience in normalizePayload
- 2026-03-27 `4ed1487` add matchesAllTags functionality with UI components and localization updates
- 2026-03-27 `259e21a` add matchesAllTags and matchesAllAudience functionality with UI updates and tests
- 2026-03-27 `f34701e` implement fuzzy matching for tag and community search with scoring system
- 2026-03-27 `4820679` update taxonomy component for improved group handling and add localization for new buttons
- 2026-03-27 `ae2b7a9` add language support for communities
- 2026-03-27 `baa3bce` complete English translation and implement language switcher functionality
- 2026-03-27 `a73035c` enhance community fetching with locale support and add taxonomy reload
- 2026-03-27 `ef32561` add language switcher component and styles for localization support
- 2026-03-27 `b32930b` standardize community status and type values to English and update URL formats
- 2026-03-27 `e7795eb` complete extraction of hardcoded UI strings to i18n for Spanish localization
- 2026-03-27 `967b2ac` integrate i18next for internationalization support
- 2026-03-26 `9b0f09a` enhance CommunityModal and Map components with location handling and focus management
- 2026-03-26 `f6c0520` enhance UI components with new styles and improve functionality in Heading, ResultsBar, and InstallPromptBar
- 2026-03-26 `a6c142e` implement force refresh functionality for PWA and enhance CommunityContribution styles
- 2026-03-26 `f4ec2f6` add deletion request functionality and UI enhancements in CommunityContribution component
- 2026-03-25 `9a3e3a5` add tooltip for communities without fixed location in map component
- 2026-03-25 `6bcf7fb` enhance mobile navigation and service worker management
- 2026-03-25 `23cf7b7` add contributor support section with grid layout and links to profiles
- 2026-03-25 `7b4f649` add new contributors Manuel Martín, Mario, Jorge Hidalgo, Jorge Teixeira, David Bonilla, Juan Luis Cano Rodríguez, Mánu Fosela, Isabel Vigil Morán, Joan León, Abraham Otero, Álvaro Saugar, and Sergio Conejero Vicente to community data
- 2026-03-25 `1fdfc3d` add notification for all-contributors bot to credit data contributors
- 2026-03-25 `79943fb` add .gitattributes to set merge strategy for CHANGELOG.md
- 2026-03-25 `4fd0efb` update community details for CoruñaJUG and GDG A Coruña with new tags, URLs, and validation status
- 2026-03-25 `1160d40` enhance community sorting logic by prioritizing validation status after member presence
- 2026-03-25 `2e77d94` update community thumbnails with new images for better representation
- 2026-03-25 `9efcad4` improve social share reminder workflow by enhancing community detection logic and error handling
- 2026-03-25 `9b8dad7` enhance community ID management by adding logic to determine next community ID based on existing communities
- 2026-03-25 `4f42f5f` pass onOpenCommunity prop to Map component for community interaction
- 2026-03-25 `b5310c2` add script to find stale add-community branches and update package.json
- 2026-03-25 `78401b9` add GitHub Action to automatically update CHANGELOG.md on merge
- 2026-03-25 `690dd14` enhance changelog generation with automatic community entry updates
- 2026-03-25 `00210f2` add automatic changelog generation and update post-commit hook
- 2026-03-25 `b901e61` improve community detection logic in social share reminder workflow
- 2026-03-25 `1be60b7` implement community deletion functionality and enhance community management scripts
- 2026-03-25 `a3533d7` enhance PWA update detection and sharing functionality in Community Modal
- 2026-03-25 `47d6aa5` add social share reminder workflow and enhance sharing options in the app (#199)
- 2026-03-24 `d114274` add additional communityId entries for existing GitHub users in community-builders-members.json
- 2026-03-24 `5ebb879` add dismissActiveInput function to blur active input elements in App and TagSearch components
- 2026-03-24 `85b78a4` enhance PWA update handling with service worker communication and install prompt improvements
- 2026-03-24 `de0b7da` implement network-first strategy for data fetching and enhance community store with freshness checks
- 2026-03-24 `fe3579e` enhance community proposal handling with editor URL and draft integration
- 2026-03-24 `49138de` update README with new image and improve table of contents structure
- 2026-03-24 `345c390` add community modal opening functionality and simplify CommunityCard component
- 2026-03-24 `8043397` enhance community issue processing and contribution form
- 2026-03-24 `c62cf72` enhance community data processing and PR generation with additional fields
- 2026-03-24 `9b8e6a7` update Node.js version to 24 and upgrade workflow actions in community issue automation
- 2026-03-24 `a952575` update Node.js version to 22 in workflow files for community issue assignment and PR creation
- 2026-03-24 `7b4f84e` add environment variable FORCE_JAVASCRIPT_ACTIONS_TO_NODE24 to workflow files
- 2026-03-24 `1f69bd3` add testing instructions and guidelines for bug fixes in CLAUDE.md
- 2026-03-24 `443ada2` add testing framework and implement tests for community draft and payload normalization
- 2026-03-24 `4b628a4` enhance CommunityModal with URL grouping, improved layout, and additional metadata display
- 2026-03-23 `c9ad363` enhance install prompt functionality and add support options in heading component
- 2026-03-23 `338c2ec` implement PWA features including service worker, install prompt, and manifest
- 2026-03-23 `fffd231` update community details and remove outdated member entry
- 2026-03-23 `618debe` enhance community features with Community Builders integration and new community data
- 2026-03-23 `83be7d4` add closing reference to issue in PR body for automated community entries
- 2026-03-23 `2470d7a` update date formatting in getTodayDate function to DD/MM/YYYY
- 2026-03-23 `8b4f5b8` add health report for URLs and improve community data processing
- 2026-03-23 `25c1ab0` Enhance URL checking script with concurrency and timeout options
- 2026-03-23 `b3813f5` update community data by removing outdated LinkedIn links and enhancing UI styles for better user experience
- 2026-03-23 `40fb55a` enhance community contribution component with audience categorization and grouping
- 2026-03-23 `6b90f9c` enhance community contribution features with new taxonomy tooltip, filters, and modal updates
- 2026-03-23 `5fc392d` add TikTok support and enhance community contribution features with navigation guards and draft management
- 2026-03-23 `26813e5` update URL mappings and taxonomy for community data
- 2026-03-23 `ea51e9c` add short description field to community draft and payload; set max length for short description docs: create report for suspicious social URLs in communities.json
- 2026-03-23 `0868565` Enhance community validation and build process with new scripts and workflows
- 2026-03-23 `1be16e2` Remove outdated community entry template and add new config for issue submission
- 2026-03-23 `d2dc519` Add CommunityContribution component for community submissions
- 2026-03-23 `e307fd5` add CommunityModal component with styling and functionality

### Fixes

- 2026-03-30 `d96934d` Update parentId label to empty string in ResultsBar component and translations
- 2026-03-27 `050317e` evitar que el editor de propuestas persista rutas absolutas en communities.json
- 2026-03-25 `c227942` update support message for inclusivity
- 2026-03-24 `731af6c` correct GitHub username for communityId 543 in community-builders-members.json
- 2026-03-24 `749c63d` update contact information for Atlanticaconf community
- 2026-03-23 `4c2f65d` refine support message for community data maintenance

### Data

- 2026-03-30 `90976d9` [Actualizada GDG Spain](https://combuilderses.github.io/communities-directory/?community=207) ([PR #319](https://github.com/ComBuildersES/communities-directory/pull/319))
- 2026-03-30 `0d62115` [Actualizada Iniciador](https://combuilderses.github.io/communities-directory/?community=254) ([PR #317](https://github.com/ComBuildersES/communities-directory/pull/317))
- 2026-03-30 `5620213` [Actualizada Codemotion Madrid](https://combuilderses.github.io/communities-directory/?community=94) ([PR #315](https://github.com/ComBuildersES/communities-directory/pull/315))
- 2026-03-30 `9c377e8` [Actualizada GDG Spain](https://combuilderses.github.io/communities-directory/?community=207) ([PR #313](https://github.com/ComBuildersES/communities-directory/pull/313))
- 2026-03-29 `07ff861` [Actualizada Madrid-Groovy User Group (GUG)](https://combuilderses.github.io/communities-directory/?community=330) ([PR #310](https://github.com/ComBuildersES/communities-directory/pull/310))
- 2026-03-29 `9f1c8b7` [Actualizada MadridJUG](https://combuilderses.github.io/communities-directory/?community=333) ([PR #306](https://github.com/ComBuildersES/communities-directory/pull/306))
- 2026-03-27 `30e597a` [Añadida GEG Spain](https://combuilderses.github.io/communities-directory/?community=606) ([PR #301](https://github.com/ComBuildersES/communities-directory/pull/301))
- 2026-03-27 `4bb5096` [Actualizada T3chFest](https://combuilderses.github.io/communities-directory/?community=440) ([PR #298](https://github.com/ComBuildersES/communities-directory/pull/298))
- 2026-03-27 `67c651d` [Actualizada NodeJSMadrid](https://combuilderses.github.io/communities-directory/?community=366) ([PR #294](https://github.com/ComBuildersES/communities-directory/pull/294))
- 2026-03-27 `76ec93b` [Actualizada Asociación de Webmasters de Granada](https://combuilderses.github.io/communities-directory/?community=37) ([PR #292](https://github.com/ComBuildersES/communities-directory/pull/292))
- 2026-03-27 `4dc1b5f` [Actualizada NodeJSMadrid](https://combuilderses.github.io/communities-directory/?community=366) ([PR #290](https://github.com/ComBuildersES/communities-directory/pull/290))
- 2026-03-26 `a1249fc` [Actualizada Liferay Spain User Group (LUGSpain)](https://combuilderses.github.io/communities-directory/?community=317) ([PR #285](https://github.com/ComBuildersES/communities-directory/pull/285))
- 2026-03-26 `efae707` [Añadida Rust Girona](https://combuilderses.github.io/communities-directory/?community=605) ([PR #281](https://github.com/ComBuildersES/communities-directory/pull/281))
- 2026-03-26 `4931d4f` [Actualizada Sysarmy Galicia](https://combuilderses.github.io/communities-directory/?community=439) ([PR #279](https://github.com/ComBuildersES/communities-directory/pull/279))
- 2026-03-26 `3c4a91f` [Actualizada Gen AI Community](https://combuilderses.github.io/communities-directory/?community=361) ([PR #277](https://github.com/ComBuildersES/communities-directory/pull/277))
- 2026-03-26 `be4a31a` Eliminada Cloud Español ([PR #273](https://github.com/ComBuildersES/communities-directory/pull/273))
- 2026-03-25 `4eebfd1` [Actualizada GDG Toledo](https://combuilderses.github.io/communities-directory/?community=208) ([PR #270](https://github.com/ComBuildersES/communities-directory/pull/270))
- 2026-03-25 `00a06a6` [Actualizada Asturias Software Crafters](https://combuilderses.github.io/communities-directory/?community=41) ([PR #267](https://github.com/ComBuildersES/communities-directory/pull/267))
- 2026-03-25 `538b845` [Actualizada AtlánticaConf](https://combuilderses.github.io/communities-directory/?community=45) ([PR #264](https://github.com/ComBuildersES/communities-directory/pull/264))
- 2026-03-25 `b5a3f1b` [Actualizada Lareira Conf](https://combuilderses.github.io/communities-directory/?community=541) ([PR #260](https://github.com/ComBuildersES/communities-directory/pull/260))
- 2026-03-25 `1b66f47` [Actualizada BricoLabs](https://combuilderses.github.io/communities-directory/?community=67) ([PR #256](https://github.com/ComBuildersES/communities-directory/pull/256))
- 2026-03-25 `6e80c7e` [Actualizada Grupo de Programadores e Usuarios de Linux (GPUL)](https://combuilderses.github.io/communities-directory/?community=228) ([PR #254](https://github.com/ComBuildersES/communities-directory/pull/254))
- 2026-03-25 `63e4acb` [Actualizada Python Coruña](https://combuilderses.github.io/communities-directory/?community=403) ([PR #252](https://github.com/ComBuildersES/communities-directory/pull/252))
- 2026-03-25 `07ec649` [Actualizada Coruña WTF](https://combuilderses.github.io/communities-directory/?community=112) ([PR #251](https://github.com/ComBuildersES/communities-directory/pull/251))
- 2026-03-25 `3b895f2` [Actualizada Sysarmy Galicia](https://combuilderses.github.io/communities-directory/?community=439) ([PR #249](https://github.com/ComBuildersES/communities-directory/pull/249))
- 2026-03-25 `34b5828` [Actualizada CoruñaJUG](https://combuilderses.github.io/communities-directory/?community=114) ([PR #247](https://github.com/ComBuildersES/communities-directory/pull/247))
- 2026-03-25 `30b0c67` [Actualizada GDG A Coruña](https://combuilderses.github.io/communities-directory/?community=195) ([PR #246](https://github.com/ComBuildersES/communities-directory/pull/246))
- 2026-03-25 `a71f623` [Añadida GDG Girona](https://combuilderses.github.io/communities-directory/?community=604) ([PR #242](https://github.com/ComBuildersES/communities-directory/pull/242))
- 2026-03-25 `32dc185` [Actualizada CommitConf](https://combuilderses.github.io/communities-directory/?community=100) ([PR #240](https://github.com/ComBuildersES/communities-directory/pull/240))
- 2026-03-25 `779747f` [Actualizada AiBirras](https://combuilderses.github.io/communities-directory/?community=20) ([PR #238](https://github.com/ComBuildersES/communities-directory/pull/238))
- 2026-03-25 `04038ad` [Actualizada PyData Granada](https://combuilderses.github.io/communities-directory/?community=400) ([PR #236](https://github.com/ComBuildersES/communities-directory/pull/236))
- 2026-03-25 `2cb100c` [Actualizada Granada Tech](https://combuilderses.github.io/communities-directory/?community=226) ([PR #234](https://github.com/ComBuildersES/communities-directory/pull/234))
- 2026-03-25 `36a0818` [Actualizada Gcubo](https://combuilderses.github.io/communities-directory/?community=194) ([PR #232](https://github.com/ComBuildersES/communities-directory/pull/232))
- 2026-03-25 `8bd8f59` [Actualizada GDG La Rioja](https://combuilderses.github.io/communities-directory/?community=201) ([PR #230](https://github.com/ComBuildersES/communities-directory/pull/230))
- 2026-03-25 `1a8df4f` [Actualizada GDG Cloud Español](https://combuilderses.github.io/communities-directory/?community=196) ([PR #228](https://github.com/ComBuildersES/communities-directory/pull/228))
- 2026-03-25 `02dfa04` [Actualizada CodeRioja](https://combuilderses.github.io/communities-directory/?community=96) ([PR #226](https://github.com/ComBuildersES/communities-directory/pull/226))
- 2026-03-25 `041b032` [Actualizada Cloud Native (CNCF) Rioja](https://combuilderses.github.io/communities-directory/?community=87) ([PR #224](https://github.com/ComBuildersES/communities-directory/pull/224))
- 2026-03-24 `027d524` [Actualizada J On The Beach](https://combuilderses.github.io/communities-directory/?community=301) ([PR #222](https://github.com/ComBuildersES/communities-directory/pull/222))
- 2026-03-24 `e636fd8` [Actualizada Lambda World](https://combuilderses.github.io/communities-directory/?community=312) ([PR #220](https://github.com/ComBuildersES/communities-directory/pull/220))
- 2026-03-24 `d90c41a` [Actualizada Wey Wey Web](https://combuilderses.github.io/communities-directory/?community=468) ([PR #218](https://github.com/ComBuildersES/communities-directory/pull/218))
- 2026-03-24 `efebd68` [Actualizada Grupo de Programadores e Usuarios de Linux (GPUL)](https://combuilderses.github.io/communities-directory/?community=228) ([PR #216](https://github.com/ComBuildersES/communities-directory/pull/216))
- 2026-03-24 `f6b3a9a` [Actualizada TRGCON](https://combuilderses.github.io/communities-directory/?community=451) ([PR #214](https://github.com/ComBuildersES/communities-directory/pull/214))
- 2026-03-24 `60927d1` [Actualizada Community Builders](https://combuilderses.github.io/communities-directory/?community=101) ([PR #212](https://github.com/ComBuildersES/communities-directory/pull/212))
- 2026-03-24 `b587e6b` [Actualizada Wey Wey Web](https://combuilderses.github.io/communities-directory/?community=468) ([PR #210](https://github.com/ComBuildersES/communities-directory/pull/210))
- 2026-03-24 `4860806` [Actualizada Lambda World](https://combuilderses.github.io/communities-directory/?community=312) ([PR #208](https://github.com/ComBuildersES/communities-directory/pull/208))
- 2026-03-24 `69ff79a` [Actualizada J On The Beach](https://combuilderses.github.io/communities-directory/?community=301) ([PR #206](https://github.com/ComBuildersES/communities-directory/pull/206))
- 2026-03-24 `63c24fc` [Actualizada Databeers Máaga](https://combuilderses.github.io/communities-directory/?community=129) ([PR #204](https://github.com/ComBuildersES/communities-directory/pull/204))
- 2026-03-24 `97be96d` [Actualizada TRGCON](https://combuilderses.github.io/communities-directory/?community=451) ([PR #198](https://github.com/ComBuildersES/communities-directory/pull/198))
- 2026-03-24 `e2d838c` [Añadida AlmerIA SUMMIT](https://combuilderses.github.io/communities-directory/?community=603) ([PR #193](https://github.com/ComBuildersES/communities-directory/pull/193))
- 2026-03-24 `cc1de8a` [Actualizada Tomelloso Tech](https://combuilderses.github.io/communities-directory/?community=450) ([PR #191](https://github.com/ComBuildersES/communities-directory/pull/191))
- 2026-03-24 `220371e` [Actualizada GeoVoluntarios](https://combuilderses.github.io/communities-directory/?community=212) ([PR #185](https://github.com/ComBuildersES/communities-directory/pull/185))
- 2026-03-24 `a6d3c46` [Actualizada Ping A Programadoras](https://combuilderses.github.io/communities-directory/?community=573) ([PR #179](https://github.com/ComBuildersES/communities-directory/pull/179))
- 2026-03-24 `466e0d3` [Actualizada PyData Madrid](https://combuilderses.github.io/communities-directory/?community=401) ([PR #177](https://github.com/ComBuildersES/communities-directory/pull/177))
- 2026-03-24 `2e7c2ea` [Actualizada Cloud Native (CNCF) Rioja](https://combuilderses.github.io/communities-directory/?community=87) ([PR #175](https://github.com/ComBuildersES/communities-directory/pull/175))
- 2026-03-24 `b5b3894` [Actualizada OpenSouthCode](https://combuilderses.github.io/communities-directory/?community=377) ([PR #173](https://github.com/ComBuildersES/communities-directory/pull/173))
- 2026-03-24 `bbf577c` [Actualizada MálagaJUG](https://combuilderses.github.io/communities-directory/?community=344) ([PR #171](https://github.com/ComBuildersES/communities-directory/pull/171))
- 2026-03-24 `c6b7873` [Actualizada Malaga-Scala](https://combuilderses.github.io/communities-directory/?community=342) ([PR #169](https://github.com/ComBuildersES/communities-directory/pull/169))
- 2026-03-24 `3c74c5a` [Actualizada BoquerónSec](https://combuilderses.github.io/communities-directory/?community=66) ([PR #167](https://github.com/ComBuildersES/communities-directory/pull/167))
- 2026-03-24 `8830e6a` [Actualizada NodeJSMadrid](https://combuilderses.github.io/communities-directory/?community=366) ([PR #165](https://github.com/ComBuildersES/communities-directory/pull/165))
- 2026-03-23 `452ed6d` [Actualizada GeoDevelopers](https://combuilderses.github.io/communities-directory/?community=211) ([PR #162](https://github.com/ComBuildersES/communities-directory/pull/162))
- 2026-03-23 `6c31303` [Actualizada GeoDevelopers](https://combuilderses.github.io/communities-directory/?community=211) ([PR #154](https://github.com/ComBuildersES/communities-directory/pull/154))

### Improvements

- 2026-03-27 `f4f251a` simplify results bar layout and improve chip display responsiveness

### Docs

- 2026-03-30 `7e24890` update changelog [skip ci]
- 2026-03-30 `da763a6` update changelog [skip ci]
- 2026-03-30 `cbe83ae` update changelog [skip ci]
- 2026-03-30 `5930643` update changelog [skip ci]
- 2026-03-30 `c18df01` update changelog [skip ci]
- 2026-03-29 `4293ca4` update changelog [skip ci]
- 2026-03-29 `a871567` update changelog [skip ci]
- 2026-03-29 `fdd41b7` update changelog [skip ci]
- 2026-03-29 `04a360d` update changelog [skip ci]
- 2026-03-29 `c3a4c89` update changelog [skip ci]
- 2026-03-29 `58b8b2c` update .all-contributorsrc [skip ci]
- 2026-03-29 `2c75927` update README.md [skip ci]
- 2026-03-29 `62e80e4` update changelog [skip ci]
- 2026-03-29 `242ad83` update changelog [skip ci]
- 2026-03-27 `768ad9d` update changelog [skip ci]
- 2026-03-27 `3e56798` update changelog [skip ci]
- 2026-03-27 `2dbb483` update changelog [skip ci]
- 2026-03-27 `a3fee7b` update changelog [skip ci]
- 2026-03-27 `b22b82c` update changelog [skip ci]
- 2026-03-27 `c33101a` update changelog [skip ci]
- 2026-03-27 `395dbbc` update changelog [skip ci]
- 2026-03-27 `aa0d44b` update changelog [skip ci]
- 2026-03-27 `7dc56e6` update changelog [skip ci]
- 2026-03-27 `f4cb6f6` update changelog [skip ci]
- 2026-03-27 `501a3be` update changelog [skip ci]
- 2026-03-26 `4e0eec6` update changelog [skip ci]
- 2026-03-26 `5e30bb0` update changelog [skip ci]
- 2026-03-26 `85d1e05` update changelog [skip ci]
- 2026-03-26 `cee1e66` update changelog [skip ci]
- 2026-03-26 `1a3ac52` update .all-contributorsrc [skip ci]
- 2026-03-26 `0571e53` update README.md [skip ci]
- 2026-03-26 `1820169` update changelog [skip ci]
- 2026-03-26 `bf29141` update changelog [skip ci]
- 2026-03-26 `7903302` update .all-contributorsrc [skip ci]
- 2026-03-26 `dbece01` update README.md [skip ci]
- 2026-03-26 `eca1e95` update changelog [skip ci]
- 2026-03-26 `fa7f5da` update changelog [skip ci]
- 2026-03-26 `67787ed` update .all-contributorsrc [skip ci]
- 2026-03-26 `55c6338` update README.md [skip ci]
- 2026-03-26 `25008fe` update changelog [skip ci]
- 2026-03-26 `8270327` update changelog [skip ci]
- 2026-03-26 `5d74871` update changelog [skip ci]
- 2026-03-26 `2872a05` update changelog [skip ci]
- 2026-03-26 `d615de9` update changelog [skip ci]
- 2026-03-26 `c26217a` update changelog [skip ci]
- 2026-03-26 `a4f0643` update .all-contributorsrc [skip ci]
- 2026-03-26 `183bf2e` update README.md [skip ci]
- 2026-03-26 `5695d41` update changelog [skip ci]
- 2026-03-25 `2343f58` update .all-contributorsrc [skip ci]
- 2026-03-25 `97f6dfc` update README.md [skip ci]
- 2026-03-25 `8399529` update changelog [skip ci]
- 2026-03-25 `97976af` update changelog [skip ci]
- 2026-03-25 `0adb77b` update changelog [skip ci]
- 2026-03-25 `1558781` update changelog [skip ci]
- 2026-03-25 `23e12dc` update changelog [skip ci]
- 2026-03-25 `478531b` update changelog [skip ci]
- 2026-03-25 `ac9c4ec` update .all-contributorsrc [skip ci]
- 2026-03-25 `1359c3c` update README.md [skip ci]
- 2026-03-25 `e7851fc` update changelog [skip ci]
- 2026-03-25 `e523576` update changelog [skip ci]
- 2026-03-25 `74b4366` update changelog [skip ci]
- 2026-03-25 `d0a82a6` update changelog [skip ci]
- 2026-03-25 `7416979` update changelog [skip ci]
- 2026-03-25 `cad5725` update changelog [skip ci]
- 2026-03-25 `c6896c9` update changelog [skip ci]
- 2026-03-25 `aa1977b` update changelog [skip ci]
- 2026-03-25 `ddfc66e` update changelog [skip ci]
- 2026-03-25 `47f9f99` update changelog [skip ci]
- 2026-03-25 `a87d162` update changelog [skip ci]
- 2026-03-25 `56e5c92` update changelog [skip ci]
- 2026-03-25 `26f4fe9` update changelog [skip ci]
- 2026-03-25 `0b2144a` update changelog [skip ci]
- 2026-03-25 `a80b087` update changelog [skip ci]
- 2026-03-25 `bd7d509` update changelog [skip ci]
- 2026-03-25 `86d7da1` update changelog [skip ci]
- 2026-03-25 `c3d4e2e` update changelog [skip ci]
- 2026-03-25 `b900edc` update changelog [skip ci]

### Maintenance

- 2026-03-25 `4789783` update GitHub Actions to use latest versions of checkout and setup-node
- 2026-03-24 `c785cd1` remove settings.local.json and update .gitignore to include .claude directory

### Other

- 2026-03-29 `ebf11b6` Refactor Map component and enhance legend functionality
- 2026-03-28 `3770cbf` - Updated Map.css for consistent styling and added new styles for cluster popups. (Override esri existing styles and ensure proper layout and appearance of cluster popups.) - Refactored Map.jsx to implement cluster popup functionality with SVG charts. - Introduced new constants for cluster segment configuration and popup visibility settings. - Enhanced popup handling for clusters and individual community features.
- 2026-03-27 `6a2658b` Remove obsolete image files and health report document
- 2026-03-27 `b431402` Refactor community types, statuses, and event formats to use consistent keys and translations
- 2026-03-26 `49c9eaf` Add thumbnail for Rust Girona community and include image file
- 2026-03-26 `4c02445` Update removal reason for Cloud Español community
- 2026-03-24 `0e62bf3` Add short description to community entry
- 2026-03-24 `1cee0e1` Update Twitter URL to new X.com format
- 2026-03-24 `3c03ca4` Refactor code structure for improved readability and maintainability
- 2026-03-23 `889b8c8` Remove outdated reports on suspect social URLs and URL health status
- 2026-03-23 `f21489a` Refactor code structure for improved readability and maintainability

## 2026-02

### Data

- 2026-02-12 `126385d` Update communities.json
- 2026-02-09 `4e61449` Update public/data/communities.json

### Other

- 2026-02-06 `0907898` Añadir nueva comunidad desde issue (#149)

## 2026-01

### Data

- 2026-01-14 `13fe5c3` Fix JSON formatting in communities.json

## 2025-12

### Data

- 2025-12-12 `eea012d` Update topics and contact info in communities.json

### Other

- 2025-12-14 `3c0ea79` Updated lastReviewed date for CoruñaJUG
- 2025-12-12 `126a1df` Añadir nueva comunidad desde issue (#146)
- 2025-12-12 `4c6df43` Update Women Techmakers Madrid community details
- 2025-12-12 `f117f75` Change displayOnMap to false for a community
- 2025-12-12 `d81153d` Remove 'Upscale Conf' community entry
- 2025-12-11 `bcd2b16` Añadir nueva comunidad desde issue (#144)

## 2025-11

### Other

- 2025-11-03 `29b0121` Añadir nueva comunidad desde issue (#142)

## 2025-09

### Docs

- 2025-09-03 `0b5b77f` update .all-contributorsrc [skip ci]
- 2025-09-03 `3ba477f` update README.md [skip ci]
- 2025-09-03 `f56f624` update .all-contributorsrc [skip ci]
- 2025-09-03 `d3895a4` update README.md [skip ci]

### Other

- 2025-09-12 `23e369e` Añadir nueva comunidad desde issue (#140)
- 2025-09-03 `e8e4631` Update CONTRIBUTING.md
- 2025-09-03 `a9f0165` Update CoruñaJUG info
- 2025-09-01 `d21258c` Añadir nueva comunidad desde issue (#135)

## 2025-08

### Features

- 2025-08-02 `764e6fa` add community cta

### Docs

- 2025-08-24 `67faef2` update .all-contributorsrc [skip ci]
- 2025-08-24 `b8a4f11` update README.md [skip ci]

### Other

- 2025-08-26 `cadcfe2` Añadir nueva comunidad desde issue (#132)
- 2025-08-26 `cd6862e` Añadir nueva comunidad desde issue (#130)
- 2025-08-24 `9147fb7` Añadir nueva comunidad desde issue (#127)
- 2025-08-24 `f6d93ab` Añadir nueva comunidad desde issue (#125)
- 2025-08-20 `5d8eb55` Add link to "good first issues" on Readme

## 2025-06

### Data

- 2025-06-13 `273eba8` Update communities.json

### Other

- 2025-06-24 `a6dc7a5` Update README.md
- 2025-06-20 `265bf1c` Update Global AI Community
- 2025-06-18 `0ae2526` Fixing DevFest Sevilla & Drupal Day
- 2025-06-18 `2078972` Adding contactinfo to devnulltalks
- 2025-06-18 `5d067eb` Changing /dev/null talks to meetup
- 2025-06-14 `295ccef` Añadir nueva comunidad desde issue (#121)
- 2025-06-14 `beac65f` Añadir nueva comunidad desde issue (#119)
- 2025-06-09 `291c7c9` Update community_entry.yml
- 2025-06-07 `80fd1a3` Añadir nueva comunidad desde issue (#116)
- 2025-06-07 `d544b47` Añadir nueva comunidad desde issue (#114)

## 2025-05

### Features

- 2025-05-12 `55bfd3c` update React dependencies to version 19.1.0 and implement provinces feature layer in Map component
- 2025-05-12 `f260764` integrate ArcGIS map components into the application

### Data

- 2025-05-26 `3d0848b` Update communities.json
- 2025-05-26 `197a99c` Update communities.json
- 2025-05-26 `db4c603` Update communities.json
- 2025-05-26 `9f68465` Update communities.json
- 2025-05-26 `5e295de` Update process-community-issue.js
- 2025-05-26 `2d988d7` Update communities.json
- 2025-05-26 `abc771f` Update communities.json

### Improvements

- 2025-05-16 `3426c57` clean up cluster popup field labels by removing 'SUM_' prefix and formatting names

### Docs

- 2025-05-14 `3c13e86` update .all-contributorsrc [skip ci]
- 2025-05-14 `ff98013` update README.md [skip ci]
- 2025-05-14 `a82ca32` update .all-contributorsrc [skip ci]
- 2025-05-14 `2297afc` update README.md [skip ci]
- 2025-05-14 `3db473b` update .all-contributorsrc [skip ci]
- 2025-05-14 `b5df8f1` update README.md [skip ci]
- 2025-05-14 `2235870` create .all-contributorsrc [skip ci]
- 2025-05-14 `cac73e2` update README.md [skip ci]

### Other

- 2025-05-26 `a19db28` Añadir nueva comunidad desde issue (#108)
- 2025-05-26 `ac92a03` HackellMAD X account is not maintained
- 2025-05-26 `d5a7e95` Adding missing and fixing broken images for active communities
- 2025-05-26 `248bf6b` Updating communities
- 2025-05-26 `ae0367d` Añadir nueva comunidad desde issue (#106)
- 2025-05-26 `423b18b` Añadir nueva comunidad desde issue (#104)
- 2025-05-26 `79cd98c` Añadir nueva comunidad desde issue (#102)
- 2025-05-26 `cd82d05` Añadir nueva comunidad desde issue (#100)
- 2025-05-26 `166a209` Añadir nueva comunidad desde issue (#98)
- 2025-05-26 `730db6f` Añadir nueva comunidad desde issue (#96)
- 2025-05-26 `14d5267` Añadir nueva comunidad desde issue (#94)
- 2025-05-26 `1a76176` Añadir nueva comunidad desde issue (#92)
- 2025-05-26 `0de035c` Añadir nueva comunidad desde issue (#90)
- 2025-05-26 `58cda3f` Añadir nueva comunidad desde issue (#88)
- 2025-05-26 `527194d` Añadir nueva comunidad desde issue (#86)
- 2025-05-26 `b7b668a` Añadir nueva comunidad desde issue (#84)
- 2025-05-26 `fb7dc55` Añadir nueva comunidad desde issue (#81)
- 2025-05-26 `5d8c980` Añadir nueva comunidad desde issue (#79)
- 2025-05-26 `42a8395` Añadir nueva comunidad desde issue (#77)
- 2025-05-26 `5c6b483` Añadir nueva comunidad desde issue (#75)
- 2025-05-26 `118966b` Añadir nueva comunidad desde issue (#73)
- 2025-05-26 `5dd13e7` Añadir nueva comunidad desde issue (#71)
- 2025-05-26 `3dc46bf` Añadir nueva comunidad desde issue (#69)
- 2025-05-26 `68e2973` Fixing autoincrement, starting at 0
- 2025-05-26 `0891d6c` Fixing autoincrement, starting at 0
- 2025-05-26 `ea0fa1f` Añadir nueva comunidad desde issue (#67)
- 2025-05-26 `9b0e9af` Añadir nueva comunidad desde issue (#65)
- 2025-05-26 `f5b5fb6` Adding minor change in layout
- 2025-05-26 `6b5ceca` Adding warnings and defaul view as  discussed in (#45)
- 2025-05-26 `f0067df` Improve CONTRIBUTING.md: data structures, writing, and curation scripts. (#2)
- 2025-05-26 `21ee2d7` Adding all aux scripts
- 2025-05-26 `8525ab1` Adding all aux scripts
- 2025-05-26 `80b0e7b` Reviewing data
- 2025-05-26 `11e4ae1` Adding scripts to manually review data - fixes (#64)
- 2025-05-25 `ad0ae15` Arreglando datos
- 2025-05-25 `bacf7bf` Añadiendo convenciones al repo (#2)
- 2025-05-23 `6710cf9` Añadir nueva comunidad desde issue (#59)
- 2025-05-23 `eff5291` Add Granada Tech Logo
- 2025-05-23 `63beeca` Add thumbnailUrl  to Granada Tech
- 2025-05-19 `f130100` Minor improvement to contributing.md
- 2025-05-19 `6fae5c5` Adding minor change to data
- 2025-05-19 `c9c1526` Añadir nueva comunidad desde issue (#51)
- 2025-05-19 `1ccfa35` Updating data
- 2025-05-19 `fe3f560` Changing node version to lastest
- 2025-05-19 `4b37d59` Improving local testing workflow and contributing.md
- 2025-05-18 `c48c4c3` Fixing responsive and contributing.md
- 2025-05-18 `d2f1431` Changing chart colors
- 2025-05-18 `83f989a` Improving responsive
- 2025-05-18 `6cf017f` Using production data
- 2025-05-18 `8f16d5b` Improving UI
- 2025-05-17 `57540c1` Fixing data
- 2025-05-17 `e70159e` spatial filter with map extent implemented
- 2025-05-17 `5cbc10e` changes to the map filtering (right now not working with zustand store filtering)
- 2025-05-17 `087560c` consuming new data
- 2025-05-17 `9b2d73c` Established map filtering
- 2025-05-17 `3677695` New data with displayOnMap
- 2025-05-17 `8c9fd5b` Fixing some location data
- 2025-05-17 `349dd13` Fixing geojson and location data
- 2025-05-17 `e6e9a57` Reviewing dataset
- 2025-05-16 `8b28e47` Añadir nueva comunidad desde issue (#42)
- 2025-05-16 `97cda92` Fixing ids and changing them to integer
- 2025-05-16 `60061c6` Añadir nueva comunidad desde issue (#40)
- 2025-05-16 `158fd2d` Trying to fix issue with geolocation
- 2025-05-16 `816e53d` Adding sharp to process conver images
- 2025-05-16 `694ad09` Adding mMissing step in the workflow
- 2025-05-16 `3ab1417` Fixing bug with paths in automation
- 2025-05-16 `5d1e4bf` Fixing bug with paths in automation
- 2025-05-16 `1beb9bf` Fixing bug with action
- 2025-05-16 `ee5916e` Adding property displayOnMap and an auxiliar leaflet viewer
- 2025-05-16 `25b2633` Improving data and data structure
- 2025-05-16 `57bb34f` Improving data and data structure
- 2025-05-16 `e343cc7` Consume the zustand store and create the custom hook to use the community store and filters correctly in both app views
- 2025-05-16 `bf67191` integrated toggle button in the app and the heading component to keep consistency throughout the app
- 2025-05-16 `5b73c6b` Added the view toggle button to change between the communitiesList and the map
- 2025-05-16 `121a57f` Add new datasource from geojson file
- 2025-05-16 `a6ab1b5` Fixing wrong geolocaltes communities
- 2025-05-16 `cc37797` Adding script to process and geolocate communities when merge
- 2025-05-16 `7b37be2` GraphicsLayer to FeatureLayer and add Renderers (failing right now)
- 2025-05-16 `58538a2` Changing contributing.mdm
- 2025-05-15 `15ddefe` Update README.md
- 2025-05-15 `0231dfb` Working on new CONTRIBUTING.md
- 2025-05-14 `a1ebf0b` Update vite.config.js
- 2025-05-14 `5543833` Update Switch.jsx
- 2025-05-14 `b9bf062` Add CommunitiesPopup component and styles; implement community markers on map
- 2025-05-14 `7a4d537` Update deploy.yml
- 2025-05-14 `95ce771` Deploy to gh-pages on merge acttion
- 2025-05-14 `41e35c5` Update README.md
- 2025-05-14 `d6d4932` Update README.md
- 2025-05-14 `47f248d` Create .all-contributorsrc
- 2025-05-14 `c40b10f` Update README.md
- 2025-05-14 `adc30da` Updating footer
- 2025-05-14 `a174207` Changing data source to new JSON file (#20)
- 2025-05-14 `dda4f53` Fixing URLs pointing to the wrong images
- 2025-05-14 `9d2de88` Adding mixing images
- 2025-05-13 `ed0e9b4` Añadir nueva comunidad desde issue (#17)
- 2025-05-13 `3d2f882` Update create-community-entry.yml (#4)
- 2025-05-13 `8ef354b` Changing require -> import
- 2025-05-13 `d7a8106` Adding new DB curation workflow
- 2025-05-09 `97c096b` Update README.md
- 2025-05-09 `954f4fb` Update README.md

## 2025-03

### Other

- 2025-03-27 `27cdeee` Update README.md
- 2025-03-27 `00ed798` Update README.md
- 2025-03-27 `d591332` Create CONTRIBUTING.md
- 2025-03-27 `78f9e18` Update README.md

## 2025-02

### Other

- 2025-02-23 `3d6f53b` añadido resultados dinamicos al filtrar
- 2025-02-19 `77ea171` Fixing path to local assets
- 2025-02-19 `db109f7` Adding dist folder
- 2025-02-19 `682d410` Removing dist from gitignore
- 2025-02-12 `ce7f913` Minor UI suggestions

## 2025-01

### Other

- 2025-01-05 `89bedc5` Añadidos switches metacomunidad y Organizacion paraguas
- 2025-01-05 `ca80cd8` añadido link al titulo de la card
- 2025-01-05 `694177b` fixed layout to scroll card
- 2025-01-05 `252c177` primera aproximacion footer

## 2024-12

### Other

- 2024-12-02 `24b652c` remove imports
- 2024-12-02 `753b921` integrado estado zustand con componentes boton y SideBar
- 2024-12-02 `8eaa7e5` Estado zustand para manejar el SideBar

## 2024-11

### Other

- 2024-11-30 `9bbc670` arreglado bug de multiples criterios para la misma key
- 2024-11-30 `848bc67` Diseño MVP SideBar
- 2024-11-27 `4124257` filtros implementados en la store
- 2024-11-27 `c61d326` Refactorizado Switch con Store, y primer approach a filtros
- 2024-11-26 `1bfd7a4` cambio de useEffect por useMemo
- 2024-11-26 `90b6a15` agregado al estado comunidades filtradas
- 2024-11-26 `e37fac9` refactor hook con selectores y estado
- 2024-11-26 `80b0232` incorporado devtools al estado
- 2024-11-26 `13af3f4` Extraido estado inicial de la store
- 2024-11-26 `4d7fc47` Primera aproximacion de fetching de datos a Zustand
- 2024-11-25 `cdb9a2d` Implementado Indice Inverso y busqueda facetada con estructuras Sets
- 2024-11-25 `c10776f` add build inverseIndex with Sets
- 2024-11-22 `3d069b5` fixed faceted search and invertedIndex
- 2024-11-22 `2110a95` debugeando busqueda facetada
- 2024-11-22 `9e1a3da` normalizando valores y quirar funcion indice inverso antigua
- 2024-11-22 `a12bfa8` quitado codigo comentado de CommunitiesList
- 2024-11-20 `bddbfff` Initial commit
