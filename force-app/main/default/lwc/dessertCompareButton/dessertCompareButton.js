import { LightningElement } from 'lwc';
import DessertComparisonModal from 'c/dessertComparisonModal';

export default class DessertCompareButton extends LightningElement {
    handleOpenModal() {
        DessertComparisonModal.open({
            size: 'medium',
            description: 'Compare bread product prices'
        });
    }
}
