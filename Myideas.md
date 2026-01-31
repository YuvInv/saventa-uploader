
bugs and things to imporve:


- Automatic fields:
    * Source Notes: “uploaded from CSV using Sevanta Uploader” / “uploaded from Dealigence using Sevanta Uploader” / uploaded from IVC using Sevanta Uploader
    * DealTypes: should be INV always
    * SourceType should be always “Research” - should choose the right SourceTypeID accordingly
    * 

- When trying to create a new company that already exists in the CSV:
- allow the users to “discard” this row when uploading multiple rows CSV. 
    - Do not allow editing of existing companies through the extension

- Uploading contacts fail: we should study the schema and API doc carefully to understand how to upload contacts properly

- Dealigence integration:
    * automatice detection when the user is on a Dealigence company page
    * change the UI of the extension, and allow the user to click a button to “send to Sevanta”
    * extract the relevant fields from the Dealigence page (company name, description, website, founders, etc)
    * send the extracted data to the side panel for review before upload
    * we need to think how to teach claude code to extract the relevant fields from the Dealigence page source code

- IVC integration:
    * automatic detection when the user is on an IVC company page
    * change the UI of the extension, and allow the user to click a button to “
    * extract the relevant fields from the IVC page (company name, description, website, founders, etc)
    * send the extracted data to the side panel for review before upload
    * we need to think how to teach claude code to extract the relevant fields from the IVC page source code


- Add GitHub CI/CD to automatically build and publish the extension to Chrome Web Store on new releases
    - Set up GitHub Actions workflow