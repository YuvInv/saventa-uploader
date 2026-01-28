import { useCallback } from 'react';
import type { Company, DuplicateInfo } from '../../lib/types';

export function useDuplicateCheck() {
  const checkDuplicates = useCallback(async (companies: Company[]): Promise<Company[]> => {
    const results: Company[] = [];

    for (const company of companies) {
      const companyName = company.data.CompanyName;
      const website = company.data.Website;

      if (!companyName && !website) {
        results.push(company);
        continue;
      }

      try {
        const response = await chrome.runtime.sendMessage({
          type: 'CHECK_DUPLICATE',
          companyName: companyName || '',
          website: website,
        });

        if (response.success && response.data) {
          const { isDuplicate, matches } = response.data;

          if (isDuplicate && matches.length > 0) {
            const match = matches[0];
            const matchedOn =
              match.CompanyName?.toLowerCase() === companyName?.toLowerCase()
                ? match.Website?.toLowerCase() === website?.toLowerCase()
                  ? 'both'
                  : 'CompanyName'
                : 'Website';

            const duplicateInfo: DuplicateInfo = {
              isDuplicate: true,
              matchedOn: matchedOn as 'CompanyName' | 'Website' | 'both',
              existingDeal: {
                id: match.id || '',
                CompanyName: match.CompanyName,
                Website: match.Website,
              },
            };

            results.push({
              ...company,
              duplicate: duplicateInfo,
            });
          } else {
            results.push({
              ...company,
              duplicate: { isDuplicate: false, matchedOn: 'CompanyName' },
            });
          }
        } else {
          // API error - don't block, just skip duplicate check
          results.push(company);
        }
      } catch {
        // Network error - don't block, just skip duplicate check
        results.push(company);
      }
    }

    return results;
  }, []);

  return { checkDuplicates };
}
