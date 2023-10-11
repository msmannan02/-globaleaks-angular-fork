export class RecieverTipData {
    id: string;
    creation_date: string;
    update_date: string;
    expiration_date: string;
    progressive: number;
    context_id: string;
    questionnaires: Questionnaire[];
    tor: boolean;
    mobile: boolean;
    reminder_date: string;
    enable_two_way_comments: boolean;
    enable_attachments: boolean;
    enable_whistleblower_identity: boolean;
    last_access: string;
    score: number;
    status: string;
    substatus: any;
    receivers: Receiver[];
    comments: any[];
    rfiles: any[];
    wbfiles: any[];
    data: Data;
    internaltip_id: string;
    receiver_id: string;
    custodian: boolean;
    important: boolean;
    label: string;
    enable_notifications: boolean;
    iar: any;
    context: Context;
    questionnaire: Questionnaire3;
    msg_receiver_selected: any;
    msg_receivers_selector: MsgReceiversSelector[];
    receivers_by_id: ReceiversById;
    submissionStatusStr: any;
whistleblower_identity_field: any;
  }
  
  export interface Questionnaire {
    steps: Step[];
    answers: Answers;
  }
  
  export interface Step {
    id: string;
    questionnaire_id: string;
    order: number;
    triggered_by_score: number;
    triggered_by_options: any[];
    children: Children[];
    label: string;
    description: string;
  }
  
  export interface Children {
    id: string;
    instance: string;
    editable: boolean;
    type: string;
    template_id: string;
    template_override_id: string;
    step_id: string;
    fieldgroup_id: string;
    multi_entry: boolean;
    required: boolean;
    preview: boolean;
    attrs: Attrs;
    x: number;
    y: number;
    width: number;
    triggered_by_score: number;
    triggered_by_options: TriggeredByOption[];
    options: Option[];
    children: any[];
    label: string;
    description: string;
    hint: string;
    placeholder: string;
  }
  
  export interface Attrs {
    input_validation?: InputValidation;
    max_len?: MaxLen;
    min_len?: MinLen;
    regexp?: Regexp;
    display_alphabetically?: DisplayAlphabetically;
  }
  
  export interface InputValidation {
    name: string;
    type: string;
    value: string;
  }
  
  export interface MaxLen {
    name: string;
    type: string;
    value: string;
  }
  
  export interface MinLen {
    name: string;
    type: string;
    value: string;
  }
  
  export interface Regexp {
    name: string;
    type: string;
    value: string;
  }
  
  export interface DisplayAlphabetically {
    name: string;
    type: string;
    value: boolean;
  }
  
  export interface TriggeredByOption {
    field: string;
    option: string;
    sufficient: boolean;
  }
  
  export interface Option {
    id: string;
    order: number;
    block_submission: boolean;
    score_points: number;
    score_type: string;
    trigger_receiver: any[];
    hint1: string;
    hint2: string;
    label: string;
  }
  
  export interface Answers {
    [key: string]: {
      required_status: boolean;
      value: string;
    }[];
  }
  
  export interface Receiver {
    id: string;
    name: string;
  }
  
  export interface Data {
    whistleblower_identity_provided: boolean;
    whistleblower_identity:any;
}
  
  export interface Context {
    id: string;
    hidden: boolean;
    order: number;
    tip_timetolive: number;
    tip_reminder: number;
    select_all_receivers: boolean;
    maximum_selectable_receivers: number;
    show_recipients_details: boolean;
    allow_recipients_selection: boolean;
    enable_comments: boolean;
    enable_two_way_comments: boolean;
    enable_attachments: boolean;
    score_threshold_medium: number;
    score_threshold_high: number;
    show_receivers_in_alphabetical_order: boolean;
    show_steps_navigation_interface: boolean;
    questionnaire_id: string;
    additional_questionnaire_id: string;
    receivers: string[];
    picture: boolean;
    name: string;
    description: string;
    questionnaire: Questionnaire2;
  }
  
  export interface Questionnaire2 {
    id: string;
    editable: boolean;
    name: string;
    steps: Step2[];
  }
  
  export interface Step2 {
    id: string;
    questionnaire_id: string;
    order: number;
    triggered_by_score: number;
    triggered_by_options: any[];
    children: Children2[];
    label: string;
    description: string;
  }
  
  export interface Children2 {
    id: string;
    instance: string;
    editable: boolean;
    type: string;
    template_id: string;
    template_override_id: string;
    step_id: string;
    fieldgroup_id: string;
    multi_entry: boolean;
    required: boolean;
    preview: boolean;
    attrs: Attrs2;
    x: number;
    y: number;
    width: number;
    triggered_by_score: number;
    triggered_by_options: TriggeredByOption2[];
    options: Option2[];
    children: any[];
    label: string;
    description: string;
    hint: string;
    placeholder: string;
  }
  
  export interface Attrs2 {
    input_validation?: InputValidation2;
    max_len?: MaxLen2;
    min_len?: MinLen2;
    regexp?: Regexp2;
    display_alphabetically?: DisplayAlphabetically2;
  }
  
  export interface InputValidation2 {
    name: string;
    type: string;
    value: string;
  }
  
  export interface MaxLen2 {
    name: string;
    type: string;
    value: string;
  }
  
  export interface MinLen2 {
    name: string;
    type: string;
    value: string;
  }
  
  export interface Regexp2 {
    name: string;
    type: string;
    value: string;
  }
  
  export interface DisplayAlphabetically2 {
    name: string;
    type: string;
    value: boolean;
  }
  
  export interface TriggeredByOption2 {
    field: string;
    option: string;
    sufficient: boolean;
  }
  
  export interface Option2 {
    id: string;
    order: number;
    block_submission: boolean;
    score_points: number;
    score_type: string;
    trigger_receiver: any[];
    hint1: string;
    hint2: string;
    label: string;
  }
  
  export interface Questionnaire3 {
    id: string;
    editable: boolean;
    name: string;
    steps: Step3[];
  }
  
  export interface Step3 {
    id: string;
    questionnaire_id: string;
    order: number;
    triggered_by_score: number;
    triggered_by_options: any[];
    children: Children3[];
    label: string;
    description: string;
  }
  
  export interface Children3 {
    id: string;
    instance: string;
    editable: boolean;
    type: string;
    template_id: string;
    template_override_id: string;
    step_id: string;
    fieldgroup_id: string;
    multi_entry: boolean;
    required: boolean;
    preview: boolean;
    attrs: Attrs3;
    x: number;
    y: number;
    width: number;
    triggered_by_score: number;
    triggered_by_options: TriggeredByOption3[];
    options: Option3[];
    children: any[];
    label: string;
    description: string;
    hint: string;
    placeholder: string;
  }
  
  export interface Attrs3 {
    input_validation?: InputValidation3;
    max_len?: MaxLen3;
    min_len?: MinLen3;
    regexp?: Regexp3;
    display_alphabetically?: DisplayAlphabetically3;
  }
  
  export interface InputValidation3 {
    name: string;
    type: string;
    value: string;
  }
  
  export interface MaxLen3 {
    name: string;
    type: string;
    value: string;
  }
  
  export interface MinLen3 {
    name: string;
    type: string;
    value: string;
  }
  
  export interface Regexp3 {
    name: string;
    type: string;
    value: string;
  }
  
  export interface DisplayAlphabetically3 {
    name: string;
    type: string;
    value: boolean;
  }
  
  export interface TriggeredByOption3 {
    field: string;
    option: string;
    sufficient: boolean;
  }
  
  export interface Option3 {
    id: string;
    order: number;
    block_submission: boolean;
    score_points: number;
    score_type: string;
    trigger_receiver: any[];
    hint1: string;
    hint2: string;
    label: string;
  }
  
  export interface MsgReceiversSelector {
    key: string;
    value: string;
  }
  
  export interface ReceiversById {
    [key: string]: {
      name: string;
    };
  }
  