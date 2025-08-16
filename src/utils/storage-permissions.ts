import { PermissionsHelper } from './permissions';

export const requestStoragePermission = async (): Promise<boolean> => {
	const result = await PermissionsHelper.requestStoragePermission();
	return result.granted;
};
