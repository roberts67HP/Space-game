import EngineManager from "./EngineManager";

export default class AlertWindow {
    constructor(message, buttons = []) {
        // Create the main alert window container
        this.alertWindow = document.createElement('div');
        this.alertWindow.style.position = 'absolute';
        this.alertWindow.style.top = '0px';
        this.alertWindow.style.left = '0px';
        this.alertWindow.style.width = '100%';
        this.alertWindow.style.height = '100%';
        this.alertWindow.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.alertWindow.style.zIndex = '1';
        this.alertWindow.style.display = 'flex';
        this.alertWindow.style.justifyContent = 'center';
        this.alertWindow.style.alignItems = 'center';

        // Create the inner window element (acts as a modal)
        this.window = document.createElement('div');
        this.window.style.backgroundColor = 'black';
        this.window.style.padding = '20px';
        this.window.style.borderRadius = '10px';
        this.window.style.textAlign = 'center';
        this.window.style.color = 'white';
        this.window.style.fontSize = '24px';
        this.window.style.maxWidth = '500px';
        this.window.style.width = '100%';
        this.window.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.2)';

        // Add the message
        const messageElement = document.createElement('div');
        messageElement.innerHTML = message;
        messageElement.style.marginBottom = '20px';
        
        this.window.appendChild(messageElement);

        // Create buttons container
        this.buttonContainer = document.createElement('div');
        this.buttonContainer.style.display = 'flex';
        this.buttonContainer.style.justifyContent = 'center';
        this.buttonContainer.style.marginTop = '20px';

        // Add buttons to the alert window
        buttons.forEach(button => {
            const buttonElement = document.createElement('button');
            buttonElement.innerHTML = button.text;
            buttonElement.style.margin = '0 10px';
            buttonElement.style.padding = '10px 20px';
            buttonElement.style.fontSize = '16px';
            buttonElement.style.borderRadius = '5px';
            buttonElement.style.cursor = 'pointer';
            buttonElement.style.border = 'none';
            buttonElement.style.color = 'white';
            buttonElement.style.backgroundColor = '#007bff';

            // Set the button's click handler
            buttonElement.addEventListener('click', button.onClick);

            this.buttonContainer.appendChild(buttonElement);
        });

        this.window.appendChild(this.buttonContainer);
        this.alertWindow.appendChild(this.window);
        document.body.appendChild(this.alertWindow);
    }

    close() {
        document.body.removeChild(this.alertWindow);
    }
}

