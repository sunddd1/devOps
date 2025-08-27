public with sharing class DessertProductController {
    @AuraEnabled(cacheable=true)
    public static List<PricebookEntry> getDessertProducts() {
        return [
            SELECT Product2.Id, Product2.Name, UnitPrice
            FROM PricebookEntry
            WHERE Pricebook2.IsStandard = true
            AND Product2Id IN (
                SELECT ProductId
                FROM ProductCategoryProduct
                WHERE ProductCategory.Name = 'Bread'
            )
            LIMIT 2
        ];
    }
}