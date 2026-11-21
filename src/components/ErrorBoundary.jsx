import { Component } from "react";
import i18n from "../i18n/index.js";

/**
 * Red de seguridad de toda la app. Sin ella, un error en un render (un registro con una forma
 * que el código no esperaba, por ejemplo) desmonta la app entera y deja la pantalla en
 * blanco, sin decir nada ni dar una salida. Con ella, se explica y se ofrece recargar, que es
 * lo que arregla el caso más corriente: una pestaña vieja con un JS que ya no casa con los
 * datos publicados.
 *
 * Usa la instancia de i18n directamente porque un componente de clase no puede usar hooks.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Error no controlado en la interfaz:", error, info?.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <section className="section">
        <div className="container content" role="alert">
          <h1 className="title is-4">{i18n.t("errorBoundary.title")}</h1>
          <p>{i18n.t("errorBoundary.body")}</p>
          <button type="button" className="button is-link" onClick={() => window.location.reload()}>
            {i18n.t("errorBoundary.reload")}
          </button>
        </div>
      </section>
    );
  }
}
