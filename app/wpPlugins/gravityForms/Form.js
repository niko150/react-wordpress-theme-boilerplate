// Packages
import React from 'react'
import autobind from 'autobind-decorator'
import Formsy from 'formsy-react'

// Functions
import gravityForms from './gravityForms'

// Fields
import GravityFormsText from './GravityFormsText'
import GravityFormsEmail from './GravityFormsEmail'
import GravityFormsTextarea from './GravityFormsTextarea'

// Views
import Alert from './Alert'



@autobind
class Form extends React.Component{

  state = {
    formData : null,
    layout: null,
    confirmationMessage: null,
    validationMessages: {},
    showAlert: false
  }

  static defaultProps = {
    showLabels: true,
    showTitle: true,
    showDescription: true
  }

  static propTypes = {
    id: React.PropTypes.number.isRequired,
    showLabels: React.PropTypes.bool,
    showTitle: React.PropTypes.bool,
    showDescription: React.PropTypes.bool
  }

  componentDidMount(){
    var self = this
    const { id } = this.props

    // GravityForms JS
    // if(typeof jQuery != undefined){
    //   if (typeof gf_global == 'undefined') var gf_global = {
    //     "gf_currency_config": {
    //       "name": "U.S. Dollar",
    //       "symbol_left": "$",
    //       "symbol_right": "",
    //       "symbol_padding": "",
    //       "thousand_separator": ",",
    //       "decimal_separator": ".",
    //       "decimals": 2
    //     },
    //     "base_url": "http:\/\/l.wrs.com\/wp-content\/plugins\/gravityforms",
    //     "number_formats": [],
    //     "spinnerUrl": "http:\/\/l.wrs.com\/wp-content\/plugins\/gravityforms\/images\/spinner.gif"
    //   };
    //   gravityForms.getFormInitScripts(id)
    // }

    gravityForms.getFormInitScripts(id)

    gravityForms.getForm(this.props.id, function(formData){
      self.setState({
        formData : formData,
        layout : formData.labelPlacement == 'top_label' ? 'vertical' : 'horizontal'
      })
      if(typeof jQuery != undefined){
        var pageNumber = 1
        jQuery(document).trigger('gform_post_render', [id,pageNumber])
      }
    })
  }

  onValidSubmit(input_values){
    console.log(input_values)
    var self = this
    gravityForms.submitForm(this.props.id, input_values, function(res){
      if(!res.is_valid){
        self.setState({
          validatePristine: true,
          validationMessages: res.validation_messages,
          showAlert: true
        })
        return
      }
      self.setState({
        confirmationMessage: res.confirmation_message,
        validationMessages: {},
        showAlert: false
      })
      console.log(res)
    })
  }

  hideAlert(){
    this.setState({
      showAlert: false
    })
  }

  resetForm(){
    this.setState({
      confirmationMessage: null
    })
  }

  render() {
    const { formData, layout, confirmationMessage, validationMessages, showAlert } = this.state
    const { id, showLabels, showTitle, showDescription } = this.props
    const { onValidSubmit, hideAlert, resetForm } = this

    if(confirmationMessage){
      return (
        <div>
          <div dangerouslySetInnerHTML={{__html: confirmationMessage }} />
          <button className="btn btn-info" onClick={resetForm}>Reset Form</button>
        </div>
      )
    }

    return (
      <div>
        {formData && (
          <Formsy.Form id={'gform_wrapper_'+id} onValidSubmit={onValidSubmit}>
            {showTitle && (<h3>{formData.title}</h3>)}
            {showDescription && (<p>{formData.description}</p>)}
            {showAlert && (<Alert alertClass="alert-danger" boldText="Whoops!" text="please check the form" onClick={hideAlert}/>)}
            <div className="row">
              {formData.fields.map(function(field){
                if(field.type == 'text')
                  return  <GravityFormsText key={field.id} formID={id} field={field} layout={layout} showLabel={showLabels} validationMessage={validationMessages[field.id]} />
                if(field.type == 'email')
                  return  <GravityFormsEmail key={field.id} formID={id} field={field} layout={layout} showLabel={showLabels} validationMessage={validationMessages[field.id]} />
                else if(field.type == 'textarea')
                  return <GravityFormsTextarea key={field.id} formID={id} field={field} layout={layout} showLabel={showLabels} validationMessage={validationMessages[field.id]} />
              })}
            </div>
            <button id={"gform_submit_button_"+id} className="btn btn-primary" formNoValidate={true} type="submit">{formData.button.text}</button>
          </Formsy.Form>
        )}
      </div>
    )
  }
}

export default Form