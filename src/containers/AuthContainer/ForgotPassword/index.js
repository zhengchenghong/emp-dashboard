// import { useState } from 'react';
import SendVerificationContainer from './SendVerification';
import useStyles from './style';
import SubmitPassword from './SubmitPassword';
import VerificationCode from './VerificationCode';
import { ForgotPassword } from 'aws-amplify-react';
import theme from '@app/styles/theme';
import { MuiThemeProvider } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
class ForgotPasswordContainer extends ForgotPassword {
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      email: '',
      key: '',
      sentCode: 0
    };
    this.sentCode = false;
    this.sentCount = 0;
  }

  handleSendVerification = (e) => {
    this.setState({ email: e });
    this.setState({ step: 2 });
    this.sentCode = true;
  };

  handleVerificationCode = (generatedKey) => {
    this.setState({ step: generatedKey });
    this.setState({ step: 3 });
  };

  updateAuthState = (authState) => {
    this.changeState(authState);
  };
  handleUpdatePage = () => {
    this.setState({
      email: '',
      step: 1
    });
  };

  showComponent() {
    const { step, email, key } = this.state;
    const { classes } = this.props;
    if (this.sentCode) {
      this.sentCount++;
    }

    return (
      <div className="Auth-wrapper">
        <MuiThemeProvider theme={theme}>
          <div className={classes.background}>
            {step === 1 ? (
              <SendVerificationContainer
                handle={(email) => this.handleSendVerification(email)}
                handleUpdateAuthState={(authState) =>
                  this.updateAuthState(authState)
                }
              />
            ) : step === 2 ? (
              <VerificationCode
                handle={(key) => this.handleVerificationCode(key)}
                handleUpdateAuthState={(authState) =>
                  this.updateAuthState(authState)
                }
                handleUpdatePage={() => this.handleUpdatePage()}
                email={email}
                sentCode={this.sentCode}
                sentCount={this.sentCount}
              />
            ) : (
              <SubmitPassword email={email} key={key} />
            )}
          </div>
        </MuiThemeProvider>
      </div>
    );
  }
}

export default withStyles(useStyles, { withTheme: true })(
  ForgotPasswordContainer
);
