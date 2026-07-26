import { Component } from 'react';

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('SVNS Stats Analyzer render error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="appErrorBoundary" role="alert">
        <p className="eyebrow">SVNS Stats Analyzer</p>
        <h1>画面を表示できませんでした</h1>
        <p>
          一時的な読込エラーが発生しました。ページを再読み込みしてください。
        </p>
        <p lang="en">
          The app could not be rendered. Reload the page and try again.
        </p>

        <div className="appErrorBoundaryActions">
          <button type="button" onClick={this.handleReload}>
            再読み込み / Reload
          </button>
          <a href="mailto:svnsstatsanalyzer@gmail.com">
            問い合わせ / Contact
          </a>
        </div>
      </main>
    );
  }
}
