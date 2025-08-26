public with sharing class DessertProductController {
    @AuraEnabled(cacheable=true)
    public static List<PricebookEntry> getDessertProducts() {
        return [
            SELECT Id, UnitPrice, Product2.Id, Product2.Name,
                   Product2.ProductCategoryProducts.ProductCategory.Name
            FROM PricebookEntry
            WHERE Pricebook2.IsStandard = true
            AND Product2Id IN (
                SELECT ProductId
                FROM ProductCategoryProduct
                WHERE ProductCategory.Name = 'Dessert'
            )
            LIMIT 2
        ];
    }
}
