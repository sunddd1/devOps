/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 01-11-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
import LightningAlert from 'lightning/alert';
import LightningConfirm from 'lightning/confirm';
import LightningPrompt from 'lightning/prompt';

/**
 * Reduces one or more LDS errors into a string[] of error messages.
 * @param {FetchResponse|FetchResponse[]} errors
 * @return {String[]} Error messages
 */
export function reduceErrors(errors) {
    if (!Array.isArray(errors)) {
        errors = [errors];
    }

    return (
        errors
            // Remove null/undefined items
            .filter((error) => !!error)
            // Extract an error message
            .map((error) => {
                // UI API read errors
                if (Array.isArray(error.body)) {
                    return error.body.map((e) => e.message);
                }
                // Page level errors
                else if (
                    error?.body?.pageErrors &&
                    error.body.pageErrors.length > 0
                ) {
                    return error.body.pageErrors.map((e) => e.message);
                }
                // Field level errors
                else if (
                    error?.body?.fieldErrors &&
                    Object.keys(error.body.fieldErrors).length > 0
                ) {
                    const fieldErrors = [];
                    Object.values(error.body.fieldErrors).forEach(
                        (errorArray) => {
                            fieldErrors.push(
                                ...errorArray.map((e) => e.message)
                            );
                        }
                    );
                    return fieldErrors;
                }
                // UI API DML page level errors
                else if (
                    error?.body?.output?.errors &&
                    error.body.output.errors.length > 0
                ) {
                    return error.body.output.errors.map((e) => e.message);
                }
                // UI API DML field level errors
                else if (
                    error?.body?.output?.fieldErrors &&
                    Object.keys(error.body.output.fieldErrors).length > 0
                ) {
                    const fieldErrors = [];
                    Object.values(error.body.output.fieldErrors).forEach(
                        (errorArray) => {
                            fieldErrors.push(
                                ...errorArray.map((e) => e.message)
                            );
                        }
                    );
                    return fieldErrors;
                }
                // UI API DML, Apex and network errors
                else if (error.body && typeof error.body.message === 'string') {
                    return error.body.message;
                }
                // JS errors
                else if (typeof error.message === 'string') {
                    return error.message;
                }
                // Unknown error shape so try HTTP status text
                return error.statusText;
            })
            // Flatten
            .reduce((prev, curr) => prev.concat(curr), [])
            // Remove empty strings
            .filter((message) => !!message)
    );
}

/**
 * lightning alert
 * @param {String} msg
 * @param {String} label
 * @param {String} theme default, shade, inverse, alt-inverse, success, info, warning, error, offline
 * @param {Boolean} hasHeader 
 */
export async function lightningAlert(msg, label, theme, hasHeader = true) {
    await LightningAlert.open({
        message: msg,
        label: label || 'Alert',
        theme: theme || 'default',
        variant: hasHeader ? 'header' : 'headerless'
    });
}

/**
 * lightning confirm
 * @param {String} msg
 * @param {String} label
 * @param {String} theme default, shade, inverse, alt-inverse, success, info, warning, error, offline
 * @param {Boolean} hasHeader 
 * @return {Boolean} result
 */
export async function lightningConfirm(msg, label, theme, hasHeader = true) {
    const result = await LightningConfirm.open({
        message: msg,
        label: label || 'Confirm',
        theme: theme || 'default',
        variant: hasHeader ? 'header' : 'headerless'
    });

    return result;
}

/**
 * lightning prompt
 * @param {String} msg
 * @param {String} label
 * @param {String} theme default, shade, inverse, alt-inverse, success, info, warning, error, offline
 * @param {Boolean} hasHeader 
 * @param {String} defaultValue prompt default message
 * @return {String} input Prompt message
 */
export async function lightningPrompt(msg, label, theme, hasHeader = true, defaultValue) {
    const inputResult = await LightningPrompt.open({
        message: msg,
        label: label || 'Prompt',
        theme: theme || 'default',
        variant: hasHeader ? 'header' : 'headerless',
        defaultValue: defaultValue ? defaultValue : ''
    });

    return inputResult;
}