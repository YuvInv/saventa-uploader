# Test Data Files

These CSV files are for testing the Sevanta Uploader extension.

## Important Notes

- All test companies use the `DELETETEST_` prefix for easy identification
- All websites use `.fake` domain to be obviously fake
- **Remember to delete these test records from your CRM after testing**

## Files

### test-basic-2-companies.csv
- 2 simple fake companies with just CompanyName and Website
- Use this for initial testing of the full flow
- Expected: Both should pass validation and upload successfully

### test-with-more-fields.csv
- 2 fake companies with additional Description field
- Tests that extra fields are mapped correctly
- Expected: Both should pass validation

### test-validation-errors.csv
- 3 rows, one with missing CompanyName
- Tests that validation catches required field errors
- Expected: 2 valid, 1 invalid (missing CompanyName)

## Testing Procedure

1. **First, use "Inspect Schema" to verify API connection and see available fields**
2. Upload `test-basic-2-companies.csv`
3. Check column mapping is correct
4. Review validation results
5. Click "Preview Upload" to see exact payloads
6. **Review the JSON carefully before confirming**
7. If everything looks correct, confirm upload
8. Verify records appear in CRM
9. **Delete the test records from CRM**

## Cleanup

After testing, search your CRM for "DELETETEST" and delete all matching records.
