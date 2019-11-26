# Deploy a package to IIS via Web Deploy

This action allows you to deploy a web deploy package or a folder to an IIS website with web deploy.

## Example:

```yml
    steps:
    - uses: cschleiden/webdeploy-action@v1
      with:
        webSiteName: 'My IIS Site'
        package: 'dist'
```

## Acknowledgments

This is a partial port of an Azure Pipelines [task](https://docs.microsoft.com/en-us/azure/devops/pipelines/tasks/deploy/iis-web-app-deployment-on-machine-group?view=azure-devops), not all options were ported, and the code wasn't cleaned up a lot. 