export class new_user {
  id = '';
  username = '';
  role = "receiver";
  enabled = true;
  password_change_needed = true;
  name = "";
  description = "";
  public_name = "";
  mail_address = "";
  pgp_key_fingerprint = "";
  pgp_key_remove = false;
  pgp_key_public = "";
  pgp_key_expiration = "";
  language = "en";
  notification = true;
  forcefully_selected = false;
  can_edit_general_settings = false;
  can_privilege_mask_information = false;
  can_privilege_delete_mask_information = false;
  can_grant_access_to_reports = false;
  can_delete_submission = false;
  can_postpone_expiration = true;
}